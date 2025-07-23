import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';

export default function DebugUsers({ users }) {
  return (
    <div>
      <h1>Debug: User Table</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const users = await prisma.user.findMany();
  return { props: { users } };
};