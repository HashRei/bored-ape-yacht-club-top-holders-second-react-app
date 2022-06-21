import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { gql } from "graphql-request";
import { request } from "graphql-request";

const APIURL =
  "https://api.thegraph.com/subgraphs/name/hashrei/bored-ape-yacht-club-top-holders-second";

const HTTP_GRAPHQL_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

function boredApeQuery(numberOfTokens: number) {
  return gql`
    {
      tokens(first: ${numberOfTokens}) {
      owner{
        id
        tokens {
          id
        }
      }
    }
  }`;
}

function imageQuery(nftID: string) {
  return gql`
    {
      tokens(where: {tokenID: "${nftID}"}) {
      image
    }
  }`;
}

function getQueryENSFromETHAddress(ethAddress: string) {
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

function App() {
  const minimumNftListLength = 5;

  const [tokens, setTokens] = useState([]);
  const [ensName, setEnsName] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [nftID, setNftID] = useState("0"); // There shouldn't be a nftID 0 in the collection
  const [nftImage, setNftImage] = useState("");
  const [numberOfTokens, setNumberOfTokens] = useState("30");
  const [nftListLength, setNftListLength] = useState(minimumNftListLength);

  useEffect(() => {
    fetchData();
  }, [ethAddress, numberOfTokens]);

  useMemo(() => {
    fetchNftImageData();
  }, [nftID]);

  async function fetchData() {
    if (numberOfTokens !== "0") {
      const nftListResult = await request(
        APIURL,
        boredApeQuery(parseInt(numberOfTokens))
      );
      setTokens(nftListResult.tokens);
    } else setTokens([]);

    if (ethAddress.length === 42) {
      const ethAdrressResult = await request(
        HTTP_GRAPHQL_ENDPOINT,
        getQueryENSFromETHAddress(ethAddress)
      );
      if (ethAdrressResult.domains[0] === undefined)
        setEnsName("No ENS for this address");
      else setEnsName(ethAdrressResult.domains[0].name);
    } else setEnsName("Not an ETH address");
  }

  async function fetchNftImageData() {
    const imageResult = await request(APIURL, imageQuery(nftID));
    setNftImage(imageResult.tokens[0].image);
  }

  return (
    <div className="App">
      <p>Number of Bored ape to list</p>
      <input
        type="number"
        min={0}
        style={{ width: "400px" }}
        placeholder="Enter number of listed Apes..."
        onChange={(event) => setNumberOfTokens(event.target.value)}
      />
      <p>ENS tracker</p>
      <input
        style={{ width: "400px" }}
        placeholder="Enter address..."
        onChange={(event) => setEthAddress(event.target.value)}
      />
      <p>ENS: {ensName}</p>
      <p>Image tracker</p>
      <input
        type="number"
        min={0}
        style={{ width: "400px" }}
        placeholder="Enter NFT ID..."
        onChange={(event) =>
          event.target.value !== "" && setNftID(event.target.value)
        }
      />
      <p>NFT image link:</p>{" "}
      <a href={nftImage} target="_blank" rel="noreferrer">
        {nftImage}
      </a>
      {tokens.map((token: any, index) => (
        <div key={index}>
          <b>Holder address:</b> {token.owner.id}
          {console.log("token", token)}
          <div style={{ flex: "right" }}>
            <p>Number of Bored Apes: {token.owner.tokens.length}</p>
            {token.owner.tokens.map((nfts, indexSecond: number) => (
              <div key={nfts.id}>
                <>
                  {() => setNftListLength(minimumNftListLength)}
                  {indexSecond <= nftListLength - 1 && <p>NFT # {nfts.id}</p>}
                </>
              </div>
            ))}
            {token.owner.tokens.length > nftListLength - 1 &&
              nftListLength <= minimumNftListLength && (
                <button
                  onClick={() => {
                    setNftListLength(parseInt(token.owner.tokens.length));
                  }}
                >
                  ...
                </button>
              )}
            {nftListLength > minimumNftListLength &&
              token.owner.tokens.length > minimumNftListLength && (
                <button
                  onClick={() => {
                    setNftListLength(minimumNftListLength);
                  }}
                >
                  ...
                </button>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
