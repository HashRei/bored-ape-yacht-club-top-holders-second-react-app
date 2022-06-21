import "./App.css";
import { createClient } from "urql";
import { useEffect, useMemo, useState } from "react";
import { gql } from "graphql-request";
import { request } from "graphql-request";

const APIURL =
  "https://api.thegraph.com/subgraphs/name/hashrei/bored-ape-yacht-club-top-holders-second";

const HTTP_GRAPHQL_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

const query = `
  query {
    tokens(first: 30) {
      owner{
        id
        tokens {
          id
        }
      }
    }
  }
`;

function imageQuery(nftID) {
  return gql`
    {
      tokens(where: {tokenID: "${nftID}"}) {
      image
    }
  }`;
}

function getQueryENSFromETHAddress(ethAddress) {
  return gql`
    {
      domains(first: 1, where:{owner:"${ethAddress}"}) {
      id
      name
      owner{
        id
      }
    }
  }`;
}

const client = createClient({
  url: APIURL,
});

function App() {
  const [tokens, setTokens] = useState([]);
  const [ensName, setEnsName] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [nftID, setNftID] = useState("");
  const [nftImage, setNftImage] = useState("");

  const nftListLength = 5;

  useEffect(() => {
    fetchData(ethAddress);
  }, [ethAddress]);

  useMemo(() => {
    fetchNftImageData();
  }, [nftID]);

  async function fetchData(ethAddress) {
    const response = await client.query(query).toPromise();
    setTokens(response.data.tokens);

    if (ethAddress !== undefined) {
      const result = await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryENSFromETHAddress(ethAddress)
      );
      setEnsName(result.domains[0].name);
    }
  }

  async function fetchNftImageData() {
    const imageResult = await request(APIURL, imageQuery(nftID));
    setNftImage(imageResult.tokens[0].image);
  }

  return (
    <div className="App">
      <input
        style={{ width: "400px" }}
        placeholder="Enter address..."
        onChange={(event) => setEthAddress(event.target.value)}
      />
      <p>ENS: {ensName}</p>
      <input
        style={{ width: "400px" }}
        placeholder="Enter NFT ID..."
        onChange={(event) => setNftID(event.target.value)}
      />
      <p>NFT Image:</p>{" "}
      <a href={nftImage} target="_blank" rel="noreferrer">
        {nftImage}
      </a>
      {tokens.map((token: any) => (
        <div>
          <>
            <b>Holder address:</b> {token.owner.id}
          </>
          <div style={{ flex: "right" }}>
            <p>Number of Bored Apes: {token.owner.tokens.length}</p>
            {token.owner.tokens.map((nfts, index) => (
              <>{index <= nftListLength - 1 && <p>NFT # {nfts.id}</p>}</>
            ))}
            {token.owner.tokens.length > nftListLength - 1 && <p>...</p>}
          </div>

          {/* <a href={token.image} target="_blank" rel="noreferrer">IMAGE</a> */}
        </div>
      ))}
    </div>
  );
}

export default App;
