import type { NextPage } from 'next'
import Head from 'next/head'
import { Container } from 'reactstrap'
import { AppNavbar } from '../components/AppNavbar'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Simple Kanban</title>
      </Head>
      <AppNavbar></AppNavbar>
    </div>
  )
}

export default Home
