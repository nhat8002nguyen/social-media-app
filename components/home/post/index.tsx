import { AppButtonLoading } from "@/components/atoms/AppLoading";
import ConfirmModal from "@/components/mocules/confirmModal";
import { PostModal } from "@/components/mocules/evaluationPostModal";
import { ImageViewModal } from "@/components/mocules/imageView";
import { imageUrlAlt } from "@/constants/homeConstants";
import useNewsFeed from "@/hooks/useNewsFeed";
import { appColors } from "@/shared/theme";
import {
  CheckCircle,
  ModeCommentOutlined,
  MoreVertRounded,
  ScreenShareOutlined,
  Send,
  ShareOutlined,
  ThumbUp,
  ThumbUpOutlined,
} from "@mui/icons-material";
import { IconButton, Menu, MenuItem, Rating, Typography } from "@mui/material";
import { Avatar, Card, Input, Text, useModal } from "@nextui-org/react";
import Image from "next/image";
import React, { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  closeCommentSession,
  CommentDetailState,
  CommentsState,
  fetchCommentsByPostID,
  openCommentSession,
} from "redux/slices/home/comments/commentsSlice";
import {
  deleteEvaluationPost,
  PostFormDetailState,
} from "redux/slices/home/posts/postFormSlice";
import {
  deletePresentedPost,
  PostState,
} from "redux/slices/home/posts/postListSlice";
import { RootState, useAppDispatch } from "redux/store/store";
import { MenuListCompositionProps } from "./interface";
import styles from "./styles.module.css";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Set",
  "Oct",
  "Nov",
  "Dec",
];

export interface EvaluationPostProps {
  postState: PostState;
  refreshNewsFeed: ReturnType<typeof useNewsFeed>["refreshNewsFeed"];
}

export default function EvaluationPost(props: EvaluationPostProps) {
  const { postState, refreshNewsFeed } = props;
  const postListState = useSelector((state: RootState) => state.postList);
  const [postProps, setPostProps] = useState<PostState>();
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const post = (postListState.posts as Array<PostState>).find(
      (value) => value.id == postState.id
    );
    setPostProps(post);
  }, []);

  const getDayMonth = () => {
    let date = postProps.createdAt;
    return date.getDate() + " " + monthNames[date.getMonth()];
  };

  return (
    <Card
      css={{ minHeight: "30rem", maxWidth: "40rem", backgroundColor: "white" }}
    >
      {!postProps ? (
        <AppButtonLoading />
      ) : (
        <div className={styles.postContainer}>
          <Avatar src={postProps.postOwner.image} rounded />
          <div className={styles.postMain}>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <Text css={{ fontWeight: "bold" }}>
                  {postProps.postOwner.username}
                </Text>
                {true ? <CheckCircle color="primary" fontSize="small" /> : null}
                <Text css={{ fontSize: "small" }}>
                  {postProps.postOwner.shortBio}
                </Text>
              </div>
              <div className={styles.headerRight}>
                <Text css={{ fontSize: "small" }}>{getDayMonth()}</Text>
                <MenuListComposition postProps={postProps} />
              </div>
            </div>
            <div className={styles.content}>
              <Text className={styles.title}>{postProps.title}</Text>
              <div className={styles.descriptions}>
                <Text>{postProps.body}</Text>
              </div>
              <div className={styles.ratingAndHotelDetail}>
                <PostRatingArea
                  locationRating={postProps.locationRating}
                  serviceRating={postProps.serviceRating}
                  cleanlinessRating={postProps.cleanlinessRating}
                  valueRating={postProps.valueRating}
                />
                {!postProps.hotel ? null : (
                  <div className={styles.hotelDetail}>
                    <Text
                      className={styles.hotelText}
                      color={appColors.primary}
                    >
                      {"Hotel: " + postProps.hotel.name}
                    </Text>
                    <Text
                      className={styles.hotelText}
                      color={appColors.primary}
                    >
                      {"Location: " + postProps.hotel.location}
                    </Text>
                  </div>
                )}
              </div>
              <PostImages
                images={{
                  first: postProps.images[0]?.url,
                  second: postProps.images[1]?.url,
                  third: postProps.images[2]?.url,
                }}
              />
              <InteractionMetrics {...postProps} />
              <CommentArea postProps={postProps} avatar={session?.user.image} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

const options = ["Edit", "Delete", "Report"];

const MenuListComposition = ({ postProps }: MenuListCompositionProps) => {
  const ITEM_HEIGHT = 48;

  const dispatch = useAppDispatch();
  const { session }: AuthState = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { setVisible, bindings } = useModal();
  const [postValues, setPostValues] = useState<PostFormDetailState>();
  const [menuOptions, setMenuOptions] = useState<string[]>(options);
  const [isDeleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    if (postProps != null && session?.user.db_id != null) {
      const currentPostValues: PostFormDetailState = {
        userId: session.user.db_id,
        postId: postProps.id,
        title: postProps.title,
        body: postProps.body,
        hotel: postProps.hotel?.id,
        locationRating: postProps.locationRating,
        serviceRating: postProps.serviceRating,
        cleanlinessRating: postProps.cleanlinessRating,
        valueRating: postProps.valueRating,
        images: [],
      };
      if (postProps.postOwner.email != session.user.email) {
        setMenuOptions(["Report"]);
      } else {
        setMenuOptions(["Edit", "Delete"]);
      }
      setPostValues(currentPostValues);
    }
  }, [postProps, session]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setDeleteConfirmVisible(false);
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (option: String) => {
    if (option == "Edit") {
      setAnchorEl(null);
      handleEditClick();
    } else if (option == "Delete") {
      handleDeleteClick();
    } else if (option == "Report") {
      setAnchorEl(null);
      handleReportClick();
    }
  };

  const handleEditClick = () => {
    setVisible(true);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmVisible(true);
  };

  const handlePostDeletion = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(
        deleteEvaluationPost({
          userId: postValues.userId,
          postId: postValues.postId,
        })
      ).unwrap();
      dispatch(
        deletePresentedPost({
          postId: postValues.postId,
          userId: postValues.userId,
        })
      );
      setAnchorEl(null);
    } catch (rejected) {
      console.error(rejected);
    }
  };

  const handleReportClick = () => {
    //TODO: handle report click
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertRounded />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "15ch",
          },
        }}
      >
        {menuOptions.map((option) =>
          option != "Delete" ? (
            <MenuItem key={option} onClick={(e) => handleItemClick(option)}>
              {option}
            </MenuItem>
          ) : (
            <ConfirmModal
              trigger={
                <MenuItem key={option} onClick={(e) => handleItemClick(option)}>
                  {option}
                </MenuItem>
              }
              title={"Confirmation"}
              description={"Are you sure you want to delete this post ?"}
              visible={isDeleteConfirmVisible}
              onConfirmClick={handlePostDeletion}
              onCloseClick={handleMenuClose}
              loading={deleteLoading}
            />
          )
        )}
      </Menu>
      <PostModal
        setVisible={setVisible}
        bindings={bindings}
        initialPostInfo={postValues}
        purpose="edit"
      ></PostModal>
    </div>
  );
};

const PostImages = ({ images }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>();

  if (images.first == null && images.second == null && images.third == null) {
    return;
  }

  const handleImageClick = (src: string) => {
    setImageSrc(src);
    setModalVisible(true);
  };

  if (images.first != null && images.second == null && images.third == null) {
    return (
      <div>
        <Image
          style={{ cursor: "pointer" }}
          src={images.first}
          alt={imageUrlAlt.postAlt}
          width={450}
          height={300}
          objectFit="cover"
          onClick={() => handleImageClick(images.first)}
        />
        <ImageViewModal
          visible={modalVisible}
          setVisible={setModalVisible}
          src={imageSrc}
        />
      </div>
    );
  }

  if (images.first != null && images.second != null && images.third == null) {
    return (
      <div>
        <Image
          style={{ cursor: "pointer" }}
          src={images.first}
          alt={imageUrlAlt.postAlt}
          width={225}
          height={225}
          objectFit="cover"
          onClick={() => handleImageClick(images.first)}
        />
        <Image
          style={{ cursor: "pointer" }}
          src={images.second}
          alt={imageUrlAlt.postAlt}
          width={225}
          height={225}
          objectFit="cover"
          onClick={() => handleImageClick(images.second)}
        />
        <ImageViewModal
          visible={modalVisible}
          setVisible={setModalVisible}
          src={imageSrc}
        />
      </div>
    );
  }
  if (images.first != null && images.second != null && images.third != null) {
    return (
      <div className={styles.images}>
        <div className={styles.smallImages}>
          <Image
            style={{ cursor: "pointer" }}
            src={images.first}
            alt={imageUrlAlt.postAlt}
            width={150}
            height={150}
            objectFit="cover"
            onClick={() => handleImageClick(images.first)}
          />
          <Image
            style={{ cursor: "pointer" }}
            src={images.second}
            alt={imageUrlAlt.postAlt}
            width={150}
            height={150}
            objectFit="cover"
            onClick={() => handleImageClick(images.second)}
          />
        </div>
        <div className={styles.bigImage}>
          <Image
            style={{ cursor: "pointer" }}
            src={images.third}
            alt={imageUrlAlt.postAlt}
            width={300}
            height={300}
            objectFit="cover"
            onClick={() => handleImageClick(images.third)}
          />
        </div>
        <ImageViewModal
          visible={modalVisible}
          setVisible={setModalVisible}
          src={imageSrc}
        />
      </div>
    );
  }
};

const PostRatingArea = ({
  locationRating,
  serviceRating,
  cleanlinessRating,
  valueRating,
}: PostRatingArea): ReactElement => {
  return (
    <div className={styles.ratingArea}>
      <div className={styles.ratingAreaRow}>
        <div className={styles.rating}>
          <Typography
            style={{ fontSize: "12px" }}
            className={styles.ratingText}
            component="legend"
          >
            Value ---------
          </Typography>
          <Rating
            size="small"
            name="read-only"
            precision={1}
            value={valueRating}
            readOnly
          />
        </div>
        <div className={styles.rating}>
          <Typography style={{ fontSize: "12px" }} component="legend">
            Location -----
          </Typography>
          <Rating
            size="small"
            name="read-only"
            precision={0.5}
            value={locationRating}
            readOnly
          />
        </div>
        <div className={styles.rating}>
          <Typography style={{ fontSize: "12px" }} component="legend">
            Service ------
          </Typography>
          <Rating
            size="small"
            name="read-only"
            precision={0.5}
            value={serviceRating}
            readOnly
          />
        </div>
      </div>
      <div className={styles.ratingAreaRow}>
        <div className={styles.rating}>
          <Typography
            style={{ fontSize: "12px" }}
            className={styles.ratingText}
            component="legend"
          >
            Clealiness --
          </Typography>
          <Rating
            size="small"
            name="read-only"
            precision={0.5}
            value={cleanlinessRating}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

const InteractionMetrics = ({
  likedCount,
  sharedCount,
  commentCount,
  id: postId,
}: PostState) => {
  const dispatch = useAppDispatch();
  const [liked, setLiked] = React.useState(false);
  const {
    commentSessionOpen: { postId: currentCommentOpenPostId },
    fetchingStatus,
  }: CommentsState = useSelector((state: RootState) => state.commentsState);

  const toggleLike = () => setLiked(() => !liked);

  const showNum = (num) => {
    const numStr = String(num);
    if (num < 1000) return numStr;

    if (num < 1000000) {
      if (num % 1000 == 0) {
        return numStr.substring(0, numStr.length - 3) + "k";
      } else {
        return (
          numStr.substring(0, numStr.length - 3) +
          "." +
          numStr.charAt(numStr.length - 3) +
          "k"
        );
      }
    }

    if (num % 1000000 == 0) {
      return numStr.substring(0, numStr.length - 6) + "k";
    } else {
      return (
        numStr.substring(0, numStr.length - 6) +
        "." +
        numStr.charAt(numStr.length - 6) +
        "m"
      );
    }
  };

  const handleModeCommentClick = async () => {
    if (postId == currentCommentOpenPostId) {
      dispatch(closeCommentSession());
    } else {
      await dispatch(fetchCommentsByPostID({ postId: postId }));
      dispatch(openCommentSession({ postId: postId }));
    }
  };

  return (
    <div className={styles.interactionMetrics}>
      <div className={styles.metric}>
        <LikeIcon onClick={toggleLike} liked={liked} />
        <Text css={{ fontSize: "small" }}>{showNum(likedCount)}</Text>
      </div>
      <div className={styles.metric} onClick={handleModeCommentClick}>
        {fetchingStatus == "pending" ? (
          <AppButtonLoading color={"primary"} />
        ) : (
          <ModeCommentOutlined />
        )}
        <Text css={{ fontSize: "small" }}>{showNum(commentCount)}</Text>
      </div>
      <div className={styles.metric}>
        <ScreenShareOutlined />
        <Text css={{ fontSize: "small" }}>{showNum(sharedCount)}</Text>
      </div>
      <div className={styles.metric}>
        <ShareOutlined />
      </div>
    </div>
  );
};

const LikeIcon = ({ onClick, liked }) => {
  return liked ? (
    <ThumbUp onClick={onClick} htmlColor={appColors.primary} />
  ) : (
    <ThumbUpOutlined onClick={onClick} />
  );
};

interface CommentAreaProps {
  postProps: PostState;
  avatar: string | null;
}

const CommentArea = ({ postProps, avatar }: CommentAreaProps) => {
  const {
    commentSessionOpen: { postId: currentCommentOpenPostId },
    comments,
    fetchingStatus,
  }: CommentsState = useSelector((state: RootState) => state.commentsState);

  return (
    <div className={styles.commentArea}>
      <div className={styles.commentInput}>
        <Avatar className={styles.commentInputAvatar} src={avatar} rounded />
        <Input
          className={styles.commentInputBox}
          placeholder="Write Your comment"
        />
        <Send cursor="pointer" htmlColor={appColors.primary} />
      </div>
      {currentCommentOpenPostId == postProps.id && (
        <div className={styles.commentThreads}>
          {comments.map((thread) => (
            <CommentThread key={thread.id} {...thread} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentThread = (props: CommentDetailState) => {
  const { owner, text, createdAt } = props;
  const replies = [];

  return (
    <div className={styles.commentThread}>
      <Avatar src={owner.image} />
      <div className={styles.commentThreadColumn}>
        <div className={styles.comment}>
          <Text small css={{ fontWeight: "bold" }}>
            {owner.username}
          </Text>
          <Text small>{text}</Text>
        </div>
        <div className={styles.commentInteraction}>
          <Text size={11} css={{ cursor: "pointer" }}>
            Like
          </Text>
          <Text size={11} css={{ cursor: "pointer" }}>
            Reply
          </Text>
          <Text size={11}>
            {createdAt.toLocaleDateString().replaceAll("/", "-")}
          </Text>
        </div>
        {replies?.length > 0 && (
          <div className={styles.replies}>
            {replies.map((reply) => (
              <Comment key={reply.id} {...reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Comment = (props) => {
  const { name, avatar, message, createdAt } = props;

  return (
    <div className={styles.commentThread}>
      <Avatar src={avatar} />
      <div className={styles.commentThreadColumn}>
        <div className={styles.comment}>
          <Text small css={{ fontWeight: "bold" }}>
            {name}
          </Text>
          <Text small>{message}</Text>
        </div>
        <div className={styles.commentInteraction}>
          <Text size={12} css={{ cursor: "pointer" }}>
            Like
          </Text>
          <Text size={12} css={{ cursor: "pointer" }}>
            Reply
          </Text>
          <Text size={12}>10min</Text>
        </div>
      </div>
    </div>
  );
};

interface PostRatingArea {
  locationRating: number;
  serviceRating: number;
  cleanlinessRating: number;
  valueRating: number;
}
