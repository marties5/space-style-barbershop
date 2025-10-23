import { getAllTransactionPartner } from "../transactions/actions";

const Page = async () => {
  try {
    const data = await getAllTransactionPartner();
    return <pre>{JSON.stringify(data, null, 1)}</pre>;
  } catch (error) {
    console.log(error);
    return <div>Error: {JSON.stringify(error)}</div>;
  }
};

export default Page;
