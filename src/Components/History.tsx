import React, { useEffect, useRef, useState } from 'react';
import { useSearch } from './SearchContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Modal from "./Modal"

const Parent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
background-color: #342c50;
  button {
    width: 200px;
    height: 60px;
    background-color: #4caf50;
    border-radius: 8px;
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #45a049;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #45a049;

  }
#searchHistory{
    width: 60%;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    font-size: 16px;
    margin-bottom: 20px;
    box-sizing: border-box;
    background-color: #2c3e50;

}
  .historylink {
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: Arial, sans-serif;
    font-size: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

  }

  .historylink li {
    margin-bottom: 10px;
  }

  .historylink a {
    text-decoration: none;
    color: #4caf50;
    transition: color 0.3s ease;
  }

  .historylink a:hover {
    color: darkgray;
  }

  .s {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }

  .o {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .o figure {
    margin: 10px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .o figure:hover {
    transform: scale(1.05);
  }

  .o figure img {
    width: 250px;
    height: 250px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
`;



interface Props {
    
    results: any;
    id: string;
    description: string;
    downloads: number;

    views: number;
    urls: {
    
    small: string | undefined;
    };
    onClose: () => void;
    likes: number;
}


const History: React.FC = () => {
    const { searchHistory, addToSearchHistory } = useSearch();
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [SelectedWord, setSelectedWord] = useState<Props[]>([]);
    const navigate = useNavigate();
    const [InputValue, setInputValue] = useState<string>('');
    const [ShowModal, setShowModal] = useState<boolean>(false)
    const [selectedPhotos, setselectedPhotos] = useState<Props | null>(null);
    const accessKey = 'LPkef7d7gHJlEG0CIYQ2az3h424chysgXuKHKBbVYqY';
    const containerRef = useRef<HTMLDivElement>(null);



useEffect(() => {
        const handleScroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    
        if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading) {       
            FetchPhotos();
            setPage((prevPage) => prevPage + 1);    
        }
        };
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}, [page]);
const handleClearHistory = () => {
        localStorage.removeItem('searchHistory');
        const element = document.getElementById('searchHistory');
        element?.remove();
        setPage(1); // Reset page on history clear
    };
const searchWithWords = async (e: Event) => {
    const gela = (e.target as HTMLDivElement).innerText;
    setInputValue(gela);
    try {
        const res = await axios.get(
        `https://api.unsplash.com/search/photos?query=${(e.target as HTMLDivElement)?.innerText}&page=${page}&per_page=30&client_id=${accessKey}`
        );
        const data = res.data.results.map((item: any) => ({
            id: item.id,
            description: item.description || '',
            likes: item.likes,
            urls: {
                small: item.urls.small || '',
            }
        }))
        setSelectedWord([data]);
        addToSearchHistory((e.target as HTMLDivElement)?.innerText);
    } 
    catch (error) {
        console.error('Error fetching data:', error);
    }
};
const FetchPhotos = async () => {

    try {
        const response = await axios.get(`https://api.unsplash.com/search/photos?query=${InputValue}&page=${page}&per_page=30&client_id=${accessKey}`);
        const imageData: Props[] = response.data.results.map((item: any) => ([{
            id: item.id,
            description: item.description || '',
            likes: item.likes,
            urls: {
                small: item.urls.small || '',
            },
        }]));
        setSelectedWord((prevPhotos) => (page === 1 ? imageData : [...prevPhotos, ...imageData]));
        setIsLoading(false);   
    } 
    
    catch (error) {
        console.log(error);
    }
};



const ShowModalOnClick = (image: Props) => {
    console.log('Clicked on figure. Modal should show up.');
    setselectedPhotos(image);
    setShowModal(true);
  };



return (
    <>
    <Parent ref={containerRef}>
    <button type='button' onClick={() => navigate('/')} >Home</button>
    <button onClick={handleClearHistory}>Clear History</button>
        <h1>Search History</h1>
        {isLoading ? (
        <p>Loading...</p>
        ) : (
        <div id="searchHistory">
            <ul className="historylink">
            {searchHistory.map((item, index) => (
                <li key={index}>
                <a href="#" onClick={(e) => searchWithWords(e as any)}>
                    {item}
                    </a>
                </li>
                ))}
            </ul>
            </div>
        )}
        {SelectedWord.length > 0 && (
    <div className='s'> 
    {SelectedWord.map((items, index) => (
        <div key={index} className='o'>
        {Array.isArray(items) ? (
            items.map((item, itemIndex) => (
                <figure  onClick={() => ShowModalOnClick(item)}  >
                <img key={itemIndex} src={item.urls.small} alt="" />
                </figure>
            ))
        ) : (
            <p>No Photos found.</p>
        )}
        </div>
    ))}
    </div>
)}
        </Parent>
        {ShowModal && selectedPhotos && (
        <Modal onClose={() => setShowModal(false)} image={selectedPhotos} />
    )}
    </>
    );
};

export default History;
