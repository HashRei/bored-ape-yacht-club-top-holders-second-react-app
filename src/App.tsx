import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { request } from "graphql-request";
import {
  HTTP_GRAPHQL_ENDPOINT_BORED_APE,
  HTTP_GRAPHQL_ENDPOINT_ENS,
} from "./const.js";
import {
  boredApeQuery,
  imageQuery,
  getQueryENSFromETHAddress,
  boredApeQueryForEthAddress,
} from "./queries";

function App() {
  const minimumNftListLength = 5;

  const [tokens, setTokens] = useState([]);
  const [ensName, setEnsName] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [nftID, setNftID] = useState("0"); // There shouldn't be a nftID 0 in the collection
  const [nftImage, setNftImage] = useState("");
  const [numberOfTokens, setNumberOfTokens] = useState("30");
  const [nftListLength, setNftListLength] = useState(minimumNftListLength);
  const [ethAddressTracker, setEthAddressTracker] = useState("");
  const [individualTokens, setIndividualTokens] = useState([]);
  const [nftListLengthIndividual, setNftListLengthIndividual] =
    useState(minimumNftListLength);

  useEffect(() => {
    fetchData(ethAddress, numberOfTokens, ethAddressTracker);
  }, [ethAddress, numberOfTokens, ethAddressTracker]);

  useMemo(() => {
    fetchNftImageData(nftID);
  }, [nftID]);

  async function fetchData(
    ethAddress: string,
    numberOfTokens: string,
    ethAddressTracker: string
  ) {
    if (numberOfTokens !== "0") {
      const nftListResult = await request(
        HTTP_GRAPHQL_ENDPOINT_BORED_APE,
        boredApeQuery(parseInt(numberOfTokens))
      );
      setTokens(nftListResult.tokens);
    } else setTokens([]);

    if (ethAddressTracker.length === 42) {
      const ethAdrressListResult = await request(
        HTTP_GRAPHQL_ENDPOINT_BORED_APE,
        boredApeQueryForEthAddress(ethAddressTracker)
      );
      setIndividualTokens(ethAdrressListResult.users[0].tokens);
    } else setIndividualTokens([]);

    if (ethAddress.length === 42) {
      const ethAdrressResult = await request(
        HTTP_GRAPHQL_ENDPOINT_ENS,
        getQueryENSFromETHAddress(ethAddress)
      );
      if (ethAdrressResult.domains[0] === undefined)
        setEnsName("No ENS for this address");
      else setEnsName(ethAdrressResult.domains[0].name);
    } else setEnsName("Not an ETH address");
  }

  async function fetchNftImageData(nftID: string) {
    const imageResult = await request(
      HTTP_GRAPHQL_ENDPOINT_BORED_APE,
      imageQuery(nftID)
    );
    setNftImage(imageResult.tokens[0].image);
  }

  return (
    <div className="App">
      <div style={{ position: "fixed", width: "150%" }}>
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
        <p>ETH address tracker</p>
        <input
          style={{ width: "400px" }}
          placeholder="Enter ETH address..."
          onChange={(event) => setEthAddressTracker(event.target.value)}
        />
        <p>Number of Bored Apes: {individualTokens.length}</p>
        <div>
          {individualTokens.map((token: any, index) => (
            <div key={index}>
              {index <= nftListLengthIndividual - 1 && <p>NFT# {token.id}</p>}
            </div>
          ))}
          {individualTokens.length > nftListLengthIndividual - 1 &&
            nftListLengthIndividual <= minimumNftListLength && (
              <button
                onClick={() => {
                  setNftListLengthIndividual(individualTokens.length);
                }}
              >
                ...
              </button>
            )}
          {nftListLengthIndividual > minimumNftListLength &&
            individualTokens.length > minimumNftListLength && (
              <button
                onClick={() => {
                  setNftListLengthIndividual(minimumNftListLength);
                }}
              >
                ...
              </button>
            )}
        </div>
      </div>

      <div style={{ position: "absolute", width: "50%" }}>
        {tokens.map((token: any, index) => (
          <div key={index}>
            <b>Holder address:</b> {token.owner.id}
            <div style={{ flex: "right" }}>
              <p>Number of Bored Apes: {token.owner.tokens.length}</p>
              {token.owner.tokens.map((nfts, indexSecond: number) => (
                <div key={nfts.id}>
                  <>
                    {() => setNftListLength(minimumNftListLength)}
                    {indexSecond <= nftListLength - 1 && <p>NFT# {nfts.id}</p>}
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
    </div>
  );
}

export default App;
