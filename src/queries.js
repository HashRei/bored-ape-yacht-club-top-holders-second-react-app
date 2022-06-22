import { gql } from "graphql-request";

export function boredApeQuery(numberOfTokens) {
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

export function boredApeQueryForEthAddress(ethTrackerAddress) {
  return gql`
      {
        users( where: {id: "${ethTrackerAddress}"}) {
          id
          tokens {
            id
          }
        }
    }`;
}

export function imageQuery(nftID) {
  return gql`
      {
        tokens(where: {tokenID: "${nftID}"}) {
        image
      }
    }`;
}

export function getQueryENSFromETHAddress(ethAddress) {
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
