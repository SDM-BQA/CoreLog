import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

interface Owner {
  _id: string;
  first_name: string;
  mobile_no: string;
  profile_pic: string;
}

interface Dog {
  _id: string;
  name: string;
  age: number;
  breed: string;
  owner: Owner;
}

interface GetAllDogsData {
  getAllDogs: Dog[];
}

const GET_DOGS = gql`
  query GetAllDogs {
    getAllDogs {
      _id
      name
      age
      breed
      owner {
        _id
        first_name
        mobile_no
        profile_pic
      }
    }
  }
`;

function TestComponent() {
  const { loading, error, data } = useQuery<GetAllDogsData>(GET_DOGS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <ul>
        {data?.getAllDogs?.map((dog) => (
          <li key={dog._id}>{dog.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default TestComponent;
