import { AppButtonLoading } from "@/components/atoms/AppLoading";
import { AppSmallText } from "@/components/atoms/appTexts";
import constants from "@/constants/index";
import { appColors } from "@/shared/theme";
import { validatePostValues } from "@/shared/utils/home";
import { AddPhotoAlternate, CheckCircleOutline } from "@mui/icons-material";
import { Rating, Typography } from "@mui/material";
import {
  Avatar,
  Button,
  Dropdown,
  FormElement,
  Input,
  Modal,
  Text,
  Textarea,
} from "@nextui-org/react";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  ChangeEvent,
  Key,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostListState } from "redux/slices/home/posts/interfaces";
import {
  PostFormDetailState,
  PostFormState,
  addNewEvaluationPost,
  updateEvaluationPost,
} from "redux/slices/home/posts/postFormSlice";
import { getHotelSearchList } from "redux/slices/search";
import { HotelSearchList } from "redux/slices/search/interfaces";
import { notifyRequestStatus } from "redux/slices/statusNotifications/snackbarsSlice";
import { AppDispatch, RootState, useAppDispatch } from "redux/store/store";
import { ImageViewModal } from "../imageView";
import {
  AccommodationInputProps,
  FileWithURL,
  PhotosAddingProps,
  PostModalProps,
  RatingAreaProps,
} from "./interface";
import styles from "./styles.module.css";

export const PostModal = ({
  setVisible,
  bindings,
  initialPostInfo,
  purpose,
}: PostModalProps): ReactElement => {
  const dispatch = useAppDispatch();
  const { requestStatus, requestUpdationStatus }: PostFormState = useSelector(
    (state: RootState) => state.postForm
  );
  const { session, sessionStatus }: AuthState = useSelector(
    (state: RootState) => state.auth
  );
  const [postValues, setPostValues] = useState<PostFormDetailState>();

  useEffect(() => {
    if (sessionStatus == "authenticated" && session?.user.DBID != null) {
      setPostValues((prev) => ({ ...prev, userId: session.user.DBID }));
    }
  }, [sessionStatus, session]);

  useEffect(() => {
    if (bindings.open) {
      setPostValues(
        (prev) =>
          initialPostInfo ?? {
            ...prev,
            title: null,
            body: "",
            hotel: null,
            locationRating: 2.5,
            serviceRating: 2.5,
            cleanlinessRating: 2.5,
            valueRating: 2.5,
            images: [],
            proofImages: [],
          }
      );
    }
  }, [bindings.open, initialPostInfo]);

  const handleTitleChange = (e: ChangeEvent<FormElement>) => {
    setPostValues((prev) => ({ ...prev, title: e.target.value?.trim() }));
  };

  const handleBodyChange = (e: ChangeEvent<FormElement>) => {
    const value = e.target.value;
    const validParagraph = value?.replaceAll("\n", "\\n").trim();
    setPostValues((prev) => ({ ...prev, body: validParagraph }));
  };

  const handleHotelChange = (id: number) => {
    setPostValues((prev) => ({
      ...prev,
      hotel: id,
    }));
  };

  const onPostClick = () => {
    const isValid = validatePostValues(postValues, setPostValues, dispatch);

    if (isValid == false) {
      return;
    }
    if (purpose == "add") {
      dispatch(addNewEvaluationPost(postValues))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          dispatch(
            notifyRequestStatus({
              message: "Create a new post successfully !",
              severity: "success",
            })
          );
        })
        .catch((rejectedValue) => {
          notifyError(dispatch, rejectedValue);
        });
    } else if (purpose == "edit") {
      dispatch(updateEvaluationPost(postValues))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          dispatch(
            notifyRequestStatus({
              message: "Update post successfully !",
              severity: "success",
            })
          );
        })
        .catch((rejectedValue) => {
          notifyError(dispatch, rejectedValue);
        });
    }
    setVisible(false);
  };

  function notifyError(dispatch: AppDispatch, rejectedValue) {
    console.error(rejectedValue);
    dispatch(
      notifyRequestStatus({
        message: "Failed to create or update new post, please try again !",
        severity: "error",
      })
    );
  }

  const onCloseClick = () => {
    setVisible(false);
  };

  return (
    <div>
      {!postValues ? null : (
        <Modal
          width="600px"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          {...bindings}
        >
          <Modal.Header>
            <Text id="modal-title" size={18}>
              {"Let's give a review"}
            </Text>
          </Modal.Header>
          <Modal.Body className={styles.modalBody}>
            <Input
              className={styles.titleInput}
              bordered
              label="Title"
              initialValue={postValues.title}
              onChange={handleTitleChange}
              color="primary"
            />
            <Textarea
              color="primary"
              label="Description"
              bordered
              initialValue={postValues.body}
              onChange={handleBodyChange}
              rows={7}
            />
            <AccommodationInput
              postId={postValues.postId}
              onHotelIdSelected={handleHotelChange}
              disabled={purpose == "edit"}
            />
            <RatingArea
              postInfo={postValues}
              setPostValues={setPostValues}
            ></RatingArea>
            <PhotosAdding postInfo={postValues} setPostValues={setPostValues} />
          </Modal.Body>
          <Modal.Footer
            justify={purpose == "add" ? "space-between" : "flex-end"}
          >
            {purpose == "add" && (
              <PhotosAdding
                type="proofImage"
                postInfo={postValues}
                setPostValues={setPostValues}
              />
            )}
            <div className={styles.footerButtons}>
              <Button auto flat color="error" onClick={onCloseClick}>
                Close
              </Button>
              <Button
                auto
                onClick={onPostClick}
                disabled={
                  requestStatus == "pending" ||
                  requestUpdationStatus == "pending"
                }
              >
                {requestStatus == "pending" ||
                requestUpdationStatus == "pending" ? (
                  <AppButtonLoading />
                ) : purpose == "edit" ? (
                  "Edit"
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

const AccommodationInput = ({
  postId,
  onHotelIdSelected,
  disabled,
}: AccommodationInputProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [input, setInput] = useState<string>();
  const [verified, setVerified] = useState<boolean>();

  const { hotels, searchStatus }: HotelSearchList = useSelector(
    (state: RootState) => state.hotelSearch
  );
  const { posts }: PostListState = useSelector(
    (state: RootState) => state.postList
  );
  const currentHotel = posts?.find((p) => p.id == postId)?.hotel;

  useEffect(() => {
    if (currentHotel) {
      setInput(currentHotel.name);
    }
  }, [currentHotel]);

  const handleInputChange = (e: ChangeEvent<FormElement>) => {
    setInput(e.currentTarget.value);
    setVerified(false);
  };

  const handleSearchClick = () => {
    dispatch(getHotelSearchList({ search: input, limit: 5 }));
  };

  const handleItemSelected = (key: Key) => {
    const selected = hotels.find((i) => i.id == key)?.name;
    setInput(selected);
    if (selected) {
      setVerified(true);
      onHotelIdSelected(parseInt(key.toString()));
    }
  };

  return (
    <div className={styles.hotelInput}>
      <Input
        css={{ flex: 1 }}
        bordered
        label="Enter hotel, homestay, accommodation,..."
        color="primary"
        value={input}
        onChange={handleInputChange}
        contentRight={verified && <CheckCircleOutline color="success" />}
        disabled={disabled}
      />
      <Dropdown>
        <Dropdown.Button
          onPress={handleSearchClick}
          onClick={handleSearchClick}
        >
          {"Search"}
        </Dropdown.Button>
        <Dropdown.Menu
          aria-label="Static Actions"
          onAction={handleItemSelected}
        >
          {searchStatus == "pending" ? (
            <Dropdown.Item color="error" key={0}>
              <AppButtonLoading />
            </Dropdown.Item>
          ) : hotels?.length == 0 ? (
            <Dropdown.Item color="error" key={0}>
              {"Service not found"}
            </Dropdown.Item>
          ) : (
            hotels.map((item) => (
              <Dropdown.Item key={item.id}>{item.name}</Dropdown.Item>
            ))
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

const RatingArea = ({
  postInfo,
  setPostValues,
}: RatingAreaProps): ReactElement => {
  return (
    <div className={styles.ratingArea}>
      <div className={styles.ratingAreaRow}>
        <div className={styles.rating}>
          <Typography component="legend" color={appColors.primary}>
            Value
          </Typography>
          <Rating
            name="half-rating"
            defaultValue={2.5}
            precision={1}
            value={postInfo.valueRating}
            onChange={(event, newValue) => {
              setPostValues((prev) => ({ ...prev, valueRating: newValue }));
            }}
          />
        </div>
        <div className={styles.rating}>
          <Typography component="legend" color={appColors.primary}>
            Location
          </Typography>
          <Rating
            name="half-rating"
            defaultValue={2.5}
            precision={0.5}
            value={postInfo.locationRating}
            onChange={(event, newValue) => {
              setPostValues((prev) => ({ ...prev, locationRating: newValue }));
            }}
          />
        </div>
      </div>
      <div className={styles.ratingAreaRow}>
        <div className={styles.rating}>
          <Typography component="legend" color={appColors.primary}>
            Clealiness
          </Typography>
          <Rating
            name="half-rating"
            defaultValue={2.5}
            precision={0.5}
            value={postInfo.cleanlinessRating}
            onChange={(event, newValue) => {
              setPostValues((prev) => ({
                ...prev,
                cleanlinessRating: newValue,
              }));
            }}
          />
        </div>
        <div className={styles.rating}>
          <Typography component="legend" color={appColors.primary}>
            Service
          </Typography>
          <Rating
            name="half-rating"
            defaultValue={2.5}
            precision={0.5}
            value={postInfo.serviceRating}
            onChange={(event, newValue) => {
              setPostValues((prev) => ({ ...prev, serviceRating: newValue }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

const PhotosAdding = ({
  setPostValues,
  type,
}: PhotosAddingProps): ReactElement => {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState<Array<FileWithURL>>([]);
  const [imageModalVisible, setModalVisible] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>();

  const openFileUploader = () => {
    if (files.length < 3) {
      fileInputRef.current?.click();
    }
  };

  const handleFileUpload = (e: ChangeEvent) => {
    const fileList = (e.target as any).files as FileList;
    for (let i = 0; i < fileList.length; i++) {
      setFiles((prev) => [
        ...prev,
        { file: fileList[i], url: URL.createObjectURL(fileList[i]) },
      ]);
      if (type != "proofImage") {
        setPostValues((prev: PostFormDetailState) => ({
          ...prev,
          images: [...prev.images, fileList[i]],
        }));
      } else {
        setPostValues((prev: PostFormDetailState) => ({
          ...prev,
          proofImages: [...prev.proofImages, fileList[i]],
        }));
      }
    }
  };

  const handleImageClick = (src: string) => {
    setImageSrc(src);
    setModalVisible(true);
  };

  const removeAllImages = () => {
    setFiles([]);
    if (type != "proofImage") {
      setPostValues((prev) => ({ ...prev, images: [] }));
    } else {
      setPostValues((prev) => ({ ...prev, proofImages: [] }));
    }
  };

  return (
    <div className={styles.photoAddingArea}>
      <div
        onClick={openFileUploader}
        style={{ fontSize: "2.5rem", display: "flex", alignItems: "flex-end" }}
      >
        <AddPhotoAlternate fontSize="inherit" color="primary" />
        {type == "proofImage" && (
          <AppSmallText
            styles={{ color: appColors.primary }}
            text={constants.proofImageIconLabel}
          />
        )}
      </div>
      <Input
        multiple
        hidden
        ref={fileInputRef}
        type={"file"}
        onChange={handleFileUpload}
      ></Input>
      {files.length > 0 ? (
        <Button auto size="sm" flat color="error" onClick={removeAllImages}>
          Clear
        </Button>
      ) : null}
      <div className={styles.addedFileList}>
        {files.map((file: FileWithURL, index) => (
          <Avatar
            key={index}
            pointer
            squared
            src={file.url}
            onClick={() => handleImageClick(file.url)}
          />
        ))}
      </div>
      <ImageViewModal
        visible={imageModalVisible}
        setVisible={setModalVisible}
        src={imageSrc}
      />
    </div>
  );
};
