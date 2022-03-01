import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useEffect } from 'react';
// import styles from '../styles/Home.module.css'
import io, { Socket } from 'socket.io-client'

const dev = process.env.NODE_ENV !== 'production';
export const server = dev ? 'http://localhost:3000' : 'https://leader-4.herokuapp.com/';
let socket: Socket;

const Home: NextPage = ({ socketCreated }: InferGetServerSidePropsType<GetServerSideProps>) => {

  useEffect(() => { initSocket() }, []);
  const initSocket = () => {
    if(!socketCreated) return;
    socket = io();
    socket.on('connect', () => console.log('lesa go connected on frontend'));
  }

  if(typeof window !== 'undefined') console.log(window.localStorage.getItem('user'));

  return (
    <>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async(context) => {
  await fetch(`${server}/api/socket`);
  return { props: { socketCreated: true } };
}

export default Home