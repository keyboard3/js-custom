import Link from 'next/link'

export default function Home() {
  return (
    <div>
      Hello World.{' '}
      <Link href="/about">
        <a>About</a>
      </Link>
    </div>
  )
}

export function getServerSideProps() {
  console.log("hello world");
  return {
    props: {}
  };
}