import React , {useEffect, useState} from 'react';

import { useParams } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import PlaceList from "../components/PlaceList";


const UserPlaces = () => {
  const {isLoading, error, sendRequest, clearError} = useHttpClient()
  const [loadedPlaces, setLoadedPlaces] =  useState()
    const userId = useParams().userId;
    
    useEffect(() => {
      const fetchUserPlaces = async () => {
        try {
          const { places } = await sendRequest(
            `http://localhost:5000/api/places/user/${userId}`
          );
          setLoadedPlaces(places);
        } catch (_) {}
      };

      fetchUserPlaces();
    }, [userId, sendRequest]);


    const placeDeletedHandler = (deletedPlaceId) => {
      setLoadedPlaces((prevPlaces) =>
        prevPlaces.filter((place) => place.id !== deletedPlaceId)
      );
    };

    return (
      <>
        <ErrorModal error={error} onClear={clearError} />
        {isLoading && (
          <div className="center">
            <LoadingSpinner asOverlay />
          </div>
        )}
        {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />}
      </>
    );
}

export default UserPlaces;
 