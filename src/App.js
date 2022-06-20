import "./App.css";
import { createClient } from "urql";
import { useEffect, useState } from "react";

const APIURL =
  "https://api.thegraph.com/subgraphs/name/hashrei/bored-ape-yacht-club-top-holders-second";

const query = `
  query {
    tokens(first: 30) {
      image
      owner{
        id
        tokens {
          id
        }
      }
    }
  }
`;

const client = createClient({
  url: APIURL,
});

function App() {
  const [tokens, setTokens] = useState([]);
  // const [nftListLength, setNftListLength] = useState(5);
  const nftListLength = 5;
  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    const response = await client.query(query).toPromise();
    setTokens(response.data.tokens);
  }
  return (
    <table className="App" border="1">
      {tokens.map((token, index) => (
        <tr >
          <p>
            <b>Holder address:</b> {token.owner.id}
          </p>
          <td style={{ flex: "right" }}>
            <p>Number of Bored Apes: {token.owner.tokens.length}</p>
            {token.owner.tokens.map((nfts, index) => (
              <>{index <= nftListLength - 1 && <p>NFT # {nfts.id}</p>}</>
            ))}
            {token.owner.tokens.length > nftListLength - 1 && <p>...</p>}
          </td>
          {/* {<button onClick={ setNftListLength(10)}>...</button>} */}

          {/* <a href={token.image} target="_blank" rel="noreferrer">IMAGE</a> */}
          {console.log("id:", token.owner.id)}
          {console.log("tokens:", token.owner.tokens)}
        </tr>
      ))}
    </table>
  );
}

export default App;
