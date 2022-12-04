import { AppButtonLoading } from "@/components/atoms/AppLoading";
import { appColors } from "@/shared/theme";
import { validatePostValues } from "@/shared/utils/home";
import { AddPhotoAlternate } from "@mui/icons-material";
import { Rating, Typography } from "@mui/material";
import {
  Avatar,
  Button,
  FormElement,
  Input,
  Modal,
  Text,
  Textarea,
} from "@nextui-org/react";
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  PostFormDetailState,
  PostFormState,
  postNewEvaluationPost,
  updateEvaluationPost,
} from "redux/slices/home/posts/postFormSlice";
import { RootState, useAppDispatch } from "redux/store/store";
import { ImageViewModal } from "../imageView";
import {
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
    if (sessionStatus == "authenticated" && session?.user.db_id != null) {
      setPostValues((prev) => ({ ...prev, userId: session.user.db_id }));
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
          }
      );
    }
  }, [bindings.open]);

  const handleTitleChange = (e: ChangeEvent<FormElement>) => {
    setPostValues((prev) => ({ ...prev, title: e.target.value?.trim() }));
  };

  const handleBodyChange = (e: ChangeEvent<FormElement>) => {
    setPostValues((prev) => ({ ...prev, body: e.target.value?.trim() }));
  };

  const handleHotelChange = (e: ChangeEvent<FormElement>) => {
    setPostValues((prev) => ({
      ...prev,
      hotel: parseInt(e.target.value?.trim()),
    }));
  };

  const onPostClick = async () => {
    const isValid = validatePostValues(postValues, setPostValues, dispatch);

    if (isValid == false) {
      return;
    }
    if (purpose == "add") {
      await dispatch(postNewEvaluationPost(postValues));
    } else if (purpose == "edit") {
      await dispatch(updateEvaluationPost(postValues));
    }
    setVisible(false);
  };

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
              Let's give a review
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
            <Input
              label="Hotel"
              bordered
              initialValue={postValues.hotel?.toString()}
              onChange={handleHotelChange}
              color="primary"
              //TODO: wait for implementation
              // disabled={purpose == "edit"}
              disabled
              placeholder="Wait for implemetation..."
            />
            <RatingArea
              postInfo={postValues}
              setPostValues={setPostValues}
            ></RatingArea>
          </Modal.Body>
          <Modal.Footer justify="space-between">
            <PhotosAdding postInfo={postValues} setPostValues={setPostValues} />
            <div className={styles.footerButtons}>
              <Button auto flat color="error" onClick={onCloseClick}>
                Close
              </Button>
              <Button
                auto
                onClick={onPostClick}
                disabled={requestStatus == "pending"}
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
  postInfo,
  setPostValues,
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
      setPostValues((prev: PostFormDetailState) => ({
        ...prev,
        images: [...prev.images, fileList[i]],
      }));
    }
  };

  const handleImageClick = (src: string) => {
    setImageSrc(src);
    setModalVisible(true);
  };

  const removeAllImages = () => {
    setFiles([]);
    setPostValues((prev) => ({ ...prev, images: [] }));
  };

  return (
    <div className={styles.photoAddingArea}>
      <div onClick={openFileUploader} style={{ fontSize: "2.5rem" }}>
        <AddPhotoAlternate fontSize="inherit" color="primary" />
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
