function reportableClassDecorator(constructor) {
  return class extends constructor {
    reportingURL = "http://www...";
  };
}

@reportableClassDecorator
class BugReport {
  type = "report";
  title;

  constructor(t) {
    this.title = t;
  }
}