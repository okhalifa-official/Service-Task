import Link from 'next/link';

export default function Home() {
  return <>
    <div className="eyebrow">SERVICE-ORIENTED PROGRAMMING · CS425</div>
    <h1>Course <span className="accent">Platform</span></h1>
    <p className="intro">Every request goes through the API Gateway, which forwards it to the user or course service.</p>
    <section className="tiles">
      <Link href="/login" className="tile"><span>01</span><h2>Login</h2><p>Sign in or create an account</p><b>Open login →</b></Link>
      <Link href="/courses" className="tile"><span>02</span><h2>Courses</h2><p>List courses and find one by id</p><b>Open courses →</b></Link>
      <Link href="/users" className="tile"><span>03</span><h2>Users</h2><p>List users and find one by id</p><b>Open users →</b></Link>
    </section>
  </>;
}
