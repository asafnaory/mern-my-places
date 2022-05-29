import React, { useContext } from "react";
import Input from "../../shared/components/FormElements/Input";
import { useHistory } from "react-router-dom";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import Button from "../../shared/components/FormElements/Button";
import { AuthContext } from "../../shared/context/auth-context";
import "./PlaceForm.css";

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      image: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
    },
    false
  );
  const history = useHistory();

  const placeSubmitHndler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", formState.inputs.title.value);
    formData.append("image", formState.inputs.image.value);
    formData.append("description", formState.inputs.description.value);
    formData.append("address", formState.inputs.address.value);
    try {
      await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places`, "POST", formData, {
        Authorization: `Bearer ${auth.token}`,
      });
      // redirect the user to a different page
      history.push("/");
    } catch (_) {}
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHndler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          element="input"
          label="Title"
          id="title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="please enter a valid title"
          onInput={inputHandler}
        />
        <ImageUpload
          center
          id="image"
          onInput={inputHandler}
          errorText="please provide an image"
        />
        <Input
          element="textarea"
          label="Description"
          id="description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="please enter a valid description (at least 5 characters)"
          onInput={inputHandler}
        />
        <Input
          element="input"
          label="Address"
          id="address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="please enter a valid address"
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
      </form>
    </>
  );
};

export default NewPlace;
