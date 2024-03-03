import styled from "styled-components";
import React, { useState } from "react";
import axios from "axios";

const Parent = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Adjusted background color transparency */
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); /* Added box shadow */
  width: 60%; /* Adjusted modal width */
  max-width: 600px; /* Set max-width for responsiveness */
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px; /* Adjusted button width */
  height: 40px; /* Adjusted button height */
  border-radius: 50%;
  border: none;
  background-color: #f00; /* Changed close button color to red */
  cursor: pointer;
  font-size: 20px;
  color: #fff;
  font-family: Arial, sans-serif;
  font-weight: bold;
`;

const ImageWrapper = styled.figure`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const Image = styled.img`
  max-width: 100%; /* Ensure image stays within its container */
  max-height: 300px; /* Set max height for responsiveness */
  border-radius: 8px;
`;

const ImageInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
`;

const InfoItem = styled.li`
  margin-bottom: 10px;
  font-size: 18px; /* Adjusted font size */
`;

interface ModalProps {
  image: {
    downloads: number;
    id: string;
    description: string;
    views: number;
    urls: {
      small: string | undefined;
    };
    likes: number;
  } | null;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ image, onClose }) => {
  const [status, setStatus] = useState({
    views: 0,
    downloads: 0,
    likes: 0
  });

  const accessKey = 'LPkef7d7gHJlEG0CIYQ2az3h424chysgXuKHKBbVYqY';

  if (!image) {
    return null;
  }

  const getStatus = async () => {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/photos/${image.id}/?client_id=${accessKey}`
      );
      setStatus({
        views: response.data.views,
        downloads: response.data.downloads,
        likes: response.data.likes,
      });
    } catch (error) {
      console.error('Error fetching image status:', error);
    }
  };

  getStatus();

  return (
    <Parent>
      <ModalContent>
        <CloseButton onClick={onClose}>X</CloseButton>
        <ImageWrapper>
          <Image src={image.urls.small} alt="loading" />
        </ImageWrapper>
        <ImageInfo>
          <InfoList>
            <InfoItem>Likes: {status.likes}</InfoItem>
            <InfoItem>Views: {status.views}</InfoItem>
            <InfoItem>Downloads: {status.downloads}</InfoItem>
          </InfoList>
        </ImageInfo>
      </ModalContent>
    </Parent>
  );
};

export default Modal;
