import type { NextPage } from 'next'
import Head from 'next/head'
import Navbar from '../components/Navbar'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Simple Kanban</title>
        <meta name="description" content="Simple Kanban: Kanban made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
	  <Navbar />
    </div>
  )
}

export default Home
