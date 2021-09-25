; (function () {
  //为每个版本更改此版本号
  var version = [0, 0, 1, ""];

  //检查现有版本的运行
  //仅当存在运行版本且低于此版本时才覆盖
  if (typeof run != "undefined") {
    if (!run.version) {
      return;
    } else {
      for (var i = 0; i < 2; i++) {
        if (run.version[i] >= version[i]) {
          return;
        }
      }
    }
  }

  /**
   * 加载模块或执行依赖于其他模块的代码的函数
   * @param {Object} args 定义代码的参数对象
   */
  run = function (name, deps, callback, contextName) {
    var config = null;

    //规范化参数
    if (typeof name == "string") {
      //定义一个模块.
      //首先检查是否没有依赖，并调整args
      if (typeof deps == "function" || deps instanceof Function) {
        contextName = callback;
        callback = deps;
        deps = [];
      }

      contextName = contextName || currContextName;

      //如果模块已经为上下文定义，离开.
      var context = contexts[contextName];
      if (context && context.specified && context.specified[name]) {
        return run;
      }
    } else if (name instanceof Array || typeof name == "array") {
      //只是一些具有依赖关系的代码。相应地调整参数。
      contextName = callback;
      callback = deps;
      deps = name;
      name = null;
    } else if (typeof name == "function" || name instanceof Function) {
      //只是一个没有定义模块并且没有依赖关系的函数。不确定这是否有用。
      callback = name;
      contextName = deps;
      name = null;
      deps = [];
    } else {
      //name 是一个配置对象。
      var config = name;
      name = null;
      //如果没有依赖项，则调整 args
      if (typeof deps == "function" || deps instanceof Function) {
        contextName = callback;
        callback = deps;
        deps = [];
      }

      contextName = contextName || config.context || currContextName;
    }

    contextName = contextName || currContextName;

    if (contextName != "currContextName") {
      //如果在当前上下文中没有等待加载,然后将 currContextName 切换为当前 contextName。
      var loaded = contexts[currContextName] && contexts[currContextName].loaded,
        empty = {},
        canSetContext = true;
      if (loaded) {
        for (var prop in loaded) {
          if (!(prop in empty)) {
            if (!loaded[prop]) {
              canSetContext = false;
              break;
            }
          }
        }
      }
      if (canSetContext) {
        currContextName = contextName;
      }
    }

    //获取上下文，或为给定的上下文名称创建一个新的上下文。
    var context = contexts[contextName] || (contexts[contextName] = {
      waiting: [],
      baseUrl: run.baseUrl || "./",
      paths: {},
      waitSeconds: 7,
      specified: {
        "run": true
      },
      loaded: {
        "run": true
      },
      defined: {
        "run": function () {
          //使用当前上下文的运行版本.
          //如果最后一个 arg 是一个字符串，那么它就是一个上下文.
          //如果最后一个 arg 不是字符串，则向其添加上下文.
          var args = [].concat(Array.prototype.slice.call(arguments, 0));
          if (typeof arguments[arguments.length - 1] != "string") {
            args.push(contextName);
          }
          return run.apply(window, args);
        }
      }
    });

    //如果有配置对象，请使用配置值更新上下文对象。
    if (config) {
      if ("waitSeconds" in config) {
        context.waitSeconds = config.waitSeconds;
      }

      if (config.baseUrl) {
        var baseUrl = config.baseUrl;
        //确保 baseUrl 以斜杠结尾。
        if (baseUrl.charAt(baseUrl.length - 1) != "/") {
          baseUrl += "/";
        }
        context.baseUrl = baseUrl;
      }

      if (config.paths) {
        var empty = {};
        for (var prop in config.paths) {
          if (!(prop in empty)) {
            context.paths[prop] = config.paths[prop];
          }
        }
      }
    }

    //存储模块以供以后评估。
    var newLength = context.waiting.push({
      name: name,
      deps: deps,
      callback: callback
    });

    //存储插入索引以便快速查找
    if (name) {
      context.waiting[name] = newLength - 1;
    }

    //将模块标记为指定：尚未加载，但正在加载中，所以不需要再次获取它。
    if (name) {
      context.specified[name] = true;
    }

    //确定是否所有模块都已加载。如果模块未加载或已经加载，则将其添加到“要加载”列表中，并请求加载它。
    var needLoad = false;
    for (var i = 0, dep; dep = deps[i]; i++) {
      if (!(dep in context.loaded)) {
        context.loaded[dep] = false;
        run.load(dep, contextName);
        needLoad = true;
      }
    }

    //查看是否全部加载。
    run.checkLoaded(contextName);

    return run;
  }
  run.version = version;

  //为按上下文分区的模块设置存储。也创建一个默认上下文。
  var defContextName = "_runDefault";
  var currContextName = defContextName;
  var contexts = {};
  var contextLoads = [];

  //设置页面加载状态。
  var isBrowser = typeof window != "undefined";

  //为浏览器案例设置页面加载检测。
  if (isBrowser) {
    //找出baseUrl。从包含 run.js 的脚本标签中获取它。
    var scripts = document.getElementsByTagName("script");
    var rePkg = /run\.js(\W|$)/i;
    for (var i = scripts.length - 1, script; script = scripts[i]; i--) {
      var src = script.getAttribute("src");
      if (src) {
        var m = src.match(rePkg);
        if (m) {
          run.baseUrl = src.substring(0, m.index);
        }
        break;
      }
    }
  }

  /**
   * 发出加载模块的请求。根据环境和负载调用的情况，可能是异步负载。
   */
  run.load = function (moduleName, contextName) {
    if (contextName != currContextName) {
      //现在不在正确的上下文中，坚持直到当前上下文完成所有加载。
      contextLoads.push(arguments);
    } else {
      //首先导出模块的路径名。
      var url = run.convertNameToPath(moduleName, contextName);
      run.attach(url, contextName, moduleName);
      contexts[contextName].startTime = (new Date()).getTime();
    }

    //BIG TODO: 如果它是与 currContextName 不同的 contextName,
    //然后等待加载 contextName 的内容，直到 currContextName 的加载完成。
  }

  run.jsExtRegExp = /\.js$/;

  /**
   * 将模块名称转换为文件路径。
   */
  run.convertNameToPath = function (moduleName, contextName) {
    if (run.jsExtRegExp.test(moduleName)) {
      //只是一个普通路径，而不是模块名称查找，所以只需返回它。
      return moduleName;
    } else {
      //需要转换为路径的模块。
      var paths = contexts[contextName].paths;
      var syms = moduleName.split(".");
      for (var i = syms.length; i > 0; i--) {
        var parentModule = syms.slice(0, i).join(".");
        if (i != 1 || !!(paths[parentModule])) {
          var parentModulePath = paths[parentModule] || parentModule;
          if (parentModulePath != parentModule) {
            syms.splice(0, i, parentModulePath);
            break;
          }
        }
      }

      //将路径部分连接在一起，然后确定是否需要 baseUrl。
      var url = syms.join("/") + ".js";
      return ((url.charAt(0) == '/' || url.match(/^\w+:/)) ? "" : contexts[contextName].baseUrl) + url;
    }
  }

  /**
   * 检查是否加载了上下文的所有模块，如果是，则以正确的依赖关系顺序评估新模块。
   */
  run.checkLoaded = function (contextName) {
    var context = contexts[contextName || currContextName];
    var waitInterval = context.waitSeconds * 1000;
    //可以使用 waitSeconds 为 0 来禁用等待间隔。
    var expired = waitInterval && (context.startTime + waitInterval) < (new Date()).getTime();

    //看看有没有什么东西还在飞行中。
    var loaded = context.loaded,
      empty = {},
      noLoads = "";
    for (var prop in loaded) {
      if (!(prop in empty)) {
        if (!loaded[prop]) {
          if (expired) {
            noLoads += prop + " ";
          } else {
            //有些东西仍在等待加载。
            setTimeout(function () {
              run.checkLoaded(contextName);
            }, 50);
            return;
          }
        }
      }
    }

    //如果等待时间到期，则抛出卸载模块的错误。
    if (expired) {
      throw new Error("run.js load timeout for modules: " + noLoads);
    }

    //解决依赖关系。首先清理状态因为模块的评估可能会创建新的加载任务，所以需要重置。
    var waiting = context.waiting;
    context.waiting = [];
    context.loaded = {};

    //遍历依赖项，进行深度优先搜索。
    var orderedModules = [];
    for (var i = 0, module; module = waiting[i]; i++) {
      var moduleChain = [module];
      if (module.name) {
        moduleChain[module.name] = true;
      }

      run.traceDeps(moduleChain, orderedModules, waiting, context.defined);
    }

    //按顺序调用模块回调。
    for (var i = 0, module; module = orderedModules[i]; i++) {
      //获取依赖项的对象。
      var name = module.name;
      var deps = module.deps;
      var args = [];
      for (var j = 0, dep; dep = deps[j]; j++) {
        //获取依赖模块。如果它不存在，由于循环依赖，创建一个占位符对象。
        var depModule = context.defined[dep] || (context.defined[dep] = {});
        args.push(depModule);
      }
      if (module.callback) {
        var ret = module.callback.apply(window, args);
        if (name) {
          var modDef = context.defined[name];
          if (modDef && ret) {
            //混合 ret 对象的内容。这是在我们将占位符模块传递给循环依赖的情况下完成的。
            //使用空的占位符对象来避免向 Object.prototype 添加内容的不良 JS 代码。
            var empty = {};
            for (var prop in ret) {
              if (!(ret in empty)) {
                modDef[prop] = ret[prop];
              }
            }
          } else {
            context.defined[name] = ret;
          }
        }
      }
    }

    //检查需要加载东西的其他上下文。
    if (contextLoads.length) {
      //首先，确保当前上下文没有更多的东西要加载. 定义上述模块后，可以进行新的运行调用
      loaded = context.loaded;
      empty = {};
      var allDone = true;
      for (var prop in loaded) {
        if (!(prop in empty)) {
          if (!loaded[prop]) {
            allDone = false;
            break;
          }
        }
      }

      if (allDone) {
        currContextName = contextLoads[0][1];
        var loads = contextLoads;
        //重置 contextLoads 以防某些等待加载用于另一个上下文。
        contextLoads = [];
        for (var i = 0, loadArgs; loadArgs = loads[i]; i++) {
          run.load.apply(run, loadArgs);
        }
      }
    } else {
      //确保我们重置为默认上下文。
      currContextName = defContextName;
    }
  }

  run.traceDeps = function (moduleChain, orderedModules, waiting, defined) {
    while (moduleChain.length > 0) {
      var module = moduleChain[moduleChain.length - 1];
      var deps, nextDep;
      if (module && !module.isOrdered) {
        module.isOrdered = true;

        //跟踪此资源的所有依赖项。
        deps = module.deps;
        if (deps && deps.length > 0) {
          for (var i = 0, nextDep; nextDep = deps[i]; i++) {
            var nextModule = waiting[waiting[nextDep]];
            if (nextModule && !nextModule.isOrdered && !defined[nextDep]) {
              //新的依赖。跟着下来。
              moduleChain.push(nextModule);
              if (nextModule.name) {
                moduleChain[nextModule.name] = true;
              }
              run.traceDeps(moduleChain, orderedModules, waiting, defined);
            }
          }
        }

        //将当前模块添加到有序列表中。
        orderedModules.push(module);
      }

      //完成这个要求。删除它并转到下一个。
      moduleChain.pop();
    }
  }

  var readyRegExp = /complete|loaded/;

  /**
   * 脚本加载回调，用于检查加载状态。
   *
   * @param {Event} evt 来自浏览器的已加载脚本的事件。
   */
  run.onScriptLoad = function (evt) {
    var node = evt.target || evt.srcElement;
    if (evt.type == "load" || readyRegExp.test(node.readyState)) {
      //拉出模块的名称和上下文。
      var contextName = node.getAttribute("data-runcontext");
      var moduleName = node.getAttribute("data-runmodule");

      //标记加载的模块。
      contexts[contextName].loaded[moduleName] = true;

      run.checkLoaded(contextName);

      //清理脚本绑定。
      if (node.removeEventListener) {
        node.removeEventListener("load", run.onScriptLoad, false);
      } else {
        //可能是IE。
        node.detachEvent("onreadystatechange", run.onScriptLoad);
      }
    }
  }

  /**
   * 将 URL 表示的脚本附加到当前环境. 目前只支持浏览器加载,
   * 但可以在其他环境中重新定义以做正确的事情。
   */
  run.attach = function (url, contextName, moduleName, doc) {
    if (isBrowser) {
      doc = doc || document;
      var node = doc.createElement("script");
      node.src = url;
      node.type = "text/javascript";
      node.charset = "utf-8";
      node.setAttribute("data-runcontext", contextName);
      node.setAttribute("data-runmodule", moduleName);

      //设置加载侦听器。
      if (node.addEventListener) {
        node.addEventListener("load", run.onScriptLoad, false);
      } else {
        //可能是IE。
        node.attachEvent("onreadystatechange", run.onScriptLoad);
      }

      return doc.getElementsByTagName("head")[0].appendChild(node);
    }
    return null;
  }

  //****** 开始页面加载功能 ****************
  //在加载回调上设置页面。可以把这个分开。
  var isPageLoaded = !isBrowser;
  /**
  * 将页面设置为已加载并触发对所有已加载模块的检查。
  */
  run.pageLoaded = function () {
    if (!isPageLoaded) {
      isPageLoaded = true;
      run._callReady();
    }
  }

  run._pageCallbacks = [];

  run._callReady = function () {
    var callbacks = run._pageCallbacks;
    run._pageCallbacks = [];
    for (var i = 0, callback; callback = callbacks[i]; i++) {
      callback();
    }
  }

  run.ready = function (callback) {
    if (isPageLoaded) {
      callback();
    } else {
      run._pageCallbacks.push(callback);
    }
    return run;
  }

  if (isBrowser) {
    if (window.addEventListener) {
      //标准。万岁！这里假设如果基于标准,
      //它知道 DOMContentLoaded.
      document.addEventListener("DOMContentLoaded", run.pageLoaded, false);
      window.addEventListener("load", run.pageLoaded, false);
    } else if (window.attachEvent) {
      window.attachEvent("onload", run.pageLoaded);
    }

    //在每种情况下设置轮询检查，以防上述 DOMContentLoaded 不受支持, 
    //或者如果它是类似 IE 的东西。上面的负载注册应该是最后的捕获，但看看我们是否提前走运。
    var loadInterval = setInterval(function () {
      //检查 document.readystate。
      if (/loaded|complete/.test(document.readyState)) {
        clearInterval(loadInterval);
        run.pageLoaded();
      }
    }, 10);
  }
  //****** END 页面加载功能 ****************
})();
