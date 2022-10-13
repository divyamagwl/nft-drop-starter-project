import { useEffect, useState } from 'react';
import { Metaplex } from '@metaplex-foundation/js';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import axios from "axios";

const network = WalletAdapterNetwork.Devnet;
const connection = new Connection(clusterApiUrl(network));
const mx = Metaplex.make(connection);

const Pagination = () => {
  const [address, setAddress] = useState(
    "677QHKe3M8vy1nac9JLB9xETxj2gSsooX4jdqjuEx45H",
  );

  const [nftList, setNftList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState(null);
  const perPage = 1;

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setCurrentView(null);
    //   const list = await mx.nfts().findAllByOwner({ owner: new PublicKey(address)}).run();
      const list = await mx.nfts().findAllByOwner({owner: new PublicKey(address)});
      console.log(list);
      setNftList(list);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!nftList) {
      return;
    }

    const execute = async () => {
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = currentPage * perPage;
      await loadData(startIndex, endIndex);
      setCurrentView(nftList.slice(startIndex, endIndex));
      setLoading(false);
    };
    execute();
  }, [nftList, currentPage]);

  const loadData = async (startIndex, endIndex) => {
    const nftsToLoad = nftList.filter((_, index) => (index >= startIndex && index < endIndex))

    const unresolved = nftsToLoad.map(async (metadata) => {
        const uri = metadata.uri;
        const metafromuri = await axios(uri);
        const image = metafromuri.data.image;
        metadata.image = image;
    })
    const resolved = await Promise.all(unresolved)
  };

  const changeCurrentPage = (operation) => {
    setLoading(true);
    if (operation === 'next') {
      setCurrentPage((prevValue) => prevValue + 1);
    } else {
      setCurrentPage((prevValue) => (prevValue > 1 ? prevValue - 1 : 1));
    }
  };

  return (
    <div>
      <div className="pApp">
        <div className="pcontainer">
          <h1 className="wtitle">Wallet Address</h1>
          <div className="nftForm">
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            <button className="styledButton" onClick={fetchNFTs}>
              Fetch
            </button>
          </div>
          {loading ? (
            <img className="loadingIcon" src="/loading.svg" />
          ) : (
            currentView &&
            currentView.map((nft, index) => (
              <div key={index} className="nftPreview">
                <h1>{nft.name}</h1>
                {console.log(nft)}

                <img
                  className="nftImage"
                  src={nft.image || '/fallbackImage.jpg'}
                  alt="The downloaded illustration of the provided NFT address."
                />
              </div>
            ))
          )}
          {currentView && (
            <div className="buttonWrapper">
              <button
                disabled={currentPage === 1}
                className="styledButton"
                onClick={() => changeCurrentPage('prev')}
              >
                Prev Page
              </button>
              <button
                disabled={nftList && Math.ceil(nftList.length / perPage) === currentPage}
                className="styledButton"
                onClick={() => changeCurrentPage('next')}
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pagination;
