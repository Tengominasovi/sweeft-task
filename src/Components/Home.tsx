import axios from 'axios';
import React, { useState, useEffect, useRef, FormEvent, FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import noresults from '../assets/imgs/noresu.webp'
import { useSearch } from './SearchContext';
import Modal from './Modal';


const StyledHeader = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  background-color: #2c3e50; /* Dark blue background color */
  color: #fff; /* White text color */
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add a subtle shadow */

  & h1 {
    font-family: 'Arial', sans-serif;
    font-size: 24px;
    margin: 0;
  }

  & nav {
    margin-left: auto; /* Pushes the navigation to the right */
    display: flex;
    align-items: center;

    & input {
      width: 300px;
      height: 30px;
      border: none;
      border-radius: 5px;
      padding: 5px;
      margin-right: 10px;
    }

    & a {
      color: #fff;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      padding: 8px 16px;
      border-radius: 5px;
      background-color: #3498db; /* Blue button color */
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #2980b9; /* Darker blue on hover */
      }
    }
  }
`;


const Main = styled.main`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  & .noresults {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;

    & img {
      width: 200px;
      height: 200px;
    }

    & span {
      font-size: 24px;
      font-weight: bold;
      color: #646464;
      font-family: cursive;
      margin-top: 20px;
    }
  }

  .OpenModal {
    cursor: pointer;
    margin: 10px;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }

    & img {
      width: 250px;
      height: 250px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
`;

interface Image {
    views: number;
    downloads: number;
    description: string;
    likes: number;
    urls: {
    small: string;
    };
    id: string;

}


const Home: React.FC = () => {
        const SearchinputRef = useRef<HTMLInputElement>(null);
        const [photos, setphotos] = useState<Image[]>([]);
        const [totalPages, setTotalPages] = useState<number>(0);
        const [page, setPage] = useState<number>(1);
        const { addToSearchHistory } = useSearch()
        const [defaultValue, setDefaultValue] = useState<string>('all')
        const [ShowModal, setShowModal] = useState<boolean>(false)
        const [selectedPhotos, setselectedPhotos] = useState<Image | null>(null);
        const accessKey = 'LPkef7d7gHJlEG0CIYQ2az3h424chysgXuKHKBbVYqY';

  const ShowModalOnClick = (image: Image) => {
    console.log('Clicked on figure. Modal should show up.');
    setselectedPhotos(image);
    setShowModal(true);
  };

     
    const Fetchphotos = async () => {
    try {
        const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${SearchinputRef.current!.value}&page=${page}&per_page=30&client_id=${accessKey}`
        );

        const imageData: Image[] = response.data.results.map((item: any) => ({
        id: item.id,
        description: item.description || '',
        likes: item.likes,
        urls: {
            small: item.urls.small || '',
        },
        }));
        

      // If it's the first page, set the photos directly; otherwise, concatenate them
        setphotos((prevphotos) => (page === 1 ? imageData : [...prevphotos, ...imageData]));
        setTotalPages(response.data.total_pages);
    } catch (error) {
        console.log(error);
    }
    };

    const FetchPopularPhotos = async () => {
    try {
        const response = await axios.get(`https://api.unsplash.com/photos/?order_by=popular&page=${page}&per_page=20&client_id=${accessKey}`);

        const imageData: Image[] = response.data.map((item: any) => ({
        id: item.id,
        description: item.description || '',
        likes: item.likes,
        urls: {
            small: item.urls.small || '',
        },
    }));

      // If it's the first page, set the photos directly; otherwise, concatenate them
        setphotos((prevphotos) => (page === 1 ? imageData : [...prevphotos, ...imageData]));
        setTotalPages(response.headers['x-total-pages']);
    } catch (error) {
        console.log(error);
    }
    };

    const HandleSearch: FormEventHandler<HTMLFormElement> = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerm = SearchinputRef.current!.value.trim();
    setphotos([]); // Reset photos when initiating a new search
    setPage(1); // Reset page to 1 when initiating a new search
    setDefaultValue(SearchinputRef.current!.value);
    if (!searchTerm) {
      // If input is empty, fetch popular photos
        FetchPopularPhotos();
    } else {
      // If input is not empty, fetch search results
        Fetchphotos();
        addToSearchHistory(searchTerm);
    }
    };



    const FetchMorePopularPhotos = async () => {
    try {
        const response = await axios.get(`https://api.unsplash.com/search/photos?query=${defaultValue}&page=${page}&per_page=30&client_id=${accessKey}`);

        const imageData: Image[] = response.data.results.map((item: any) => ({
        id: item.id,
        description: item.description || '',
        likes: item.likes,
        urls: {
            small: item.urls.small || '',
        },
        }));


      // Concatenate the new photos to the existing ones
        setphotos((prevphotos) => [...prevphotos, ...imageData]);
        setPage((prevPage) => prevPage + 1);
        setTotalPages(response.headers['x-total-pages']);
    } catch (error) {
        console.log(error);
    }
    };

    const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 20 ) {
      // Load more popular photos when scrolling to the bottom
        FetchMorePopularPhotos();
    }
    };

    useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
    }, [handleScroll]);

    useEffect(() => {
    // Fetch popular photos when the component mounts
    FetchPopularPhotos();

    

    }, []);
    const Navigate = useNavigate();
        
    
        return (
            <>
            <StyledHeader>
            <h1>Search photos</h1>
            <nav>
                <form onSubmit={HandleSearch}>
                <input type="text" placeholder="Type and enter..." ref={SearchinputRef} />
                </form>
                <a href="" onClick={() => Navigate('/History')}>
                History
                </a>
            </nav>
            </StyledHeader>
            <Main>
            {photos.length === 0 ? (
                <figure className="noresults">
                    <img src={noresults} alt="" />
                <span>No Results</span>
                </figure>
            ) : (
                photos.map((image) => (
    
                <figure  className="OpenModal"  onClick={() => ShowModalOnClick(image)} >
                    <img src={image.urls.small} alt={image.description} />
                </figure>
                ))
            )}

          
            </Main>
            {ShowModal && selectedPhotos && (
        <Modal image={selectedPhotos} onClose={() => setShowModal(false)} />
      )}
            </>
        
        );
    };
    
    export default Home;