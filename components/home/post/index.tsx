import { AppButtonLoading } from "@/components/atoms/AppLoading";
import ProfileLink from "@/components/atoms/ProfileLink";
import { AppSmallText, SmallGreyText } from "@/components/atoms/appTexts";
import ConfirmModal from "@/components/mocules/confirmModal";
import { PostModal } from "@/components/mocules/evaluationPostModal";
import { ImageViewModal } from "@/components/mocules/imageView";
import { imageUrlAlt } from "@/constants/homeConstants";
import { appColors } from "@/shared/theme";
import { showFullLocaleDateTime, showNum } from "@/shared/utils/home";
import {
  CheckCircle,
  ModeCommentOutlined,
  MoreVertRounded,
  ScreenShareOutlined,
  Send,
  ThumbUp,
  ThumbUpOutlined,
} from "@mui/icons-material";
import { IconButton, Menu, MenuItem, Rating, Typography } from "@mui/material";
import {
  Avatar,
  Card,
  FormElement,
  Input,
  Text,
  useModal,
} from "@nextui-org/react";
import { ReplyCommentsFetchRequestDto } from "apis/home/commentsAPI";
import shareAPI from "apis/home/shareAPI";
import Image from "next/image";
import React, { KeyboardEvent, ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  CommentsState,
  addComment,
  addReplyComment,
  closeCommentSession,
  closeReplyInputOpen,
  fetchCommentsByPostID,
  fetchReplyCommentsOfCurrentComments,
  openCommentSession,
  openReplyInputOpenWithCommentId,
} from "redux/slices/home/comments/commentsSlice";
import {
  LikeState,
  likePost,
  undoPostLike,
} from "redux/slices/home/likes/likeSlice";
import { PostFormDetailState } from "redux/slices/home/posts/postFormSlice";
import {
  PostListState,
  PostState,
  deleteEvaluationPost,
  increaseCommentCountOfPost,
  setPostLiked,
  setPostShared,
} from "redux/slices/home/posts/postListSlice";
import { notifyRequestStatus } from "redux/slices/statusNotifications/snackbarsSlice";
import { RootState, useAppDispatch } from "redux/store/store";
import {
  CommentAreaProps,
  CommentInputProps,
  CommentProps,
  CommentThreadProps,
  EvaluationPostProps,
  MenuListCompositionProps,
  PostRatingArea,
} from "./interface";
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

export default function EvaluationPost({ postState }: EvaluationPostProps) {
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  const getSharedPostNote = () => {
    const sharedUsers = postState.sharedUsers;

    if (sharedUsers.length == 0) {
      return;
    }

    return (
      <AppSmallText
        styles={{ marginBottom: 5 }}
        text={
          sharedUsers[0].username +
          (sharedUsers[1] && sharedUsers[1].username != sharedUsers[0].username
            ? ", " + sharedUsers[1].username + " shared this post"
            : " shared this post")
        }
      />
    );
  };

  return (
    <Card
      css={{ minHeight: "30rem", maxWidth: "50rem", backgroundColor: "white" }}
    >
      {!postState ? (
        <AppButtonLoading />
      ) : (
        <div>
          {getSharedPostNote()}
          <div className={styles.postContainer}>
            <ProfileLink
              sessionId={session?.user.DBID}
              profileId={postState.postOwner.id}
              child={<Avatar pointer src={postState.postOwner.image} rounded />}
            />
            <div className={styles.postMain}>
              <div className={styles.header}>
                <div className={styles.headerLeft}>
                  <ProfileLink
                    sessionId={session?.user.DBID}
                    profileId={postState.postOwner.id}
                    child={
                      <Text css={{ fontWeight: "bold", cursor: "pointer" }}>
                        {postState.postOwner.username}
                      </Text>
                    }
                  />
                  {true ? (
                    <CheckCircle color="primary" fontSize="small" />
                  ) : null}
                  <Text css={{ fontSize: "small" }}>
                    {postState.postOwner.shortBio}
                  </Text>
                </div>
                <div className={styles.headerRight}>
                  <Text css={{ fontSize: "small" }}>
                    {showFullLocaleDateTime(new Date(postState.createdAt))}
                  </Text>
                  <MenuListComposition postState={postState} />
                </div>
              </div>
              <div className={styles.content}>
                <Text className={styles.title}>{postState.title}</Text>
                <div className={styles.descriptions}>
                  <Text size={14} color="grey">
                    {postState.body}
                  </Text>
                </div>
                <div className={styles.ratingAndHotelDetail}>
                  <PostRatingArea
                    locationRating={postState.locationRating}
                    serviceRating={postState.serviceRating}
                    cleanlinessRating={postState.cleanlinessRating}
                    valueRating={postState.valueRating}
                  />
                  {!postState.hotel ? null : (
                    <div className={styles.hotelDetail}>
                      <Text
                        className={styles.hotelText}
                        color={appColors.primary}
                      >
                        {"Hotel: " + postState.hotel.name}
                      </Text>
                      <Text
                        className={styles.hotelText}
                        color={appColors.primary}
                      >
                        {"Location: " + postState.hotel.location}
                      </Text>
                    </div>
                  )}
                </div>
                <PostImages
                  images={{
                    first: postState.images[0]?.url,
                    second: postState.images[1]?.url,
                    third: postState.images[2]?.url,
                  }}
                />
                <InteractionMetrics {...postState} />
                <CommentArea
                  postState={postState}
                  avatar={session?.user.image}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

const options = ["Edit", "Delete", "Report"];

const MenuListComposition = ({ postState }: MenuListCompositionProps) => {
  const ITEM_HEIGHT = 48;

  const dispatch = useAppDispatch();
  const { session }: AuthState = useSelector((state: RootState) => state.auth);
  const { deleteRequestStatus }: PostListState = useSelector(
    (state: RootState) => state.postList
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { setVisible, bindings } = useModal();
  const [postValues, setPostValues] = useState<PostFormDetailState>();
  const [menuOptions, setMenuOptions] = useState<string[]>(options);
  const [isDeleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (postState != null && session?.user.DBID != null) {
      const currentPostValues: PostFormDetailState = {
        userId: session.user.DBID,
        postId: postState.id,
        title: postState.title,
        body: postState.body,
        hotel: postState.hotel?.id,
        locationRating: postState.locationRating,
        serviceRating: postState.serviceRating,
        cleanlinessRating: postState.cleanlinessRating,
        valueRating: postState.valueRating,
        images: [],
      };
      if (postState.postOwner.email != session.user.email) {
        setMenuOptions(["Report"]);
      } else {
        setMenuOptions(["Edit", "Delete"]);
      }
      setPostValues(currentPostValues);
    }
  }, [postState, session]);

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
    try {
      await dispatch(
        deleteEvaluationPost({
          userId: postValues.userId,
          postId: postValues.postId,
        })
      );
      dispatch(
        notifyRequestStatus({
          message: "Delete your post successfully !",
          severity: "success",
        })
      );
    } catch (rejected) {
      console.error(rejected);
      dispatch(
        notifyRequestStatus({
          message: "Failed to delete this post, please try again !",
          severity: "error",
        })
      );
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
              key={option}
              trigger={
                <MenuItem key={option} onClick={(e) => handleItemClick(option)}>
                  {option}
                </MenuItem>
              }
              title={"Confirmation"}
              description={"Are you sure you want to delete this post ?"}
              visible={isDeleteConfirmVisible}
              setVisible={setDeleteConfirmVisible}
              onConfirmClick={handlePostDeletion}
              onCloseClick={handleMenuClose}
              loading={deleteRequestStatus == "pending"}
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
  id: postId,
  isLiked,
  isShared,
  likedCount,
  commentCount,
  sharedCount,
}: PostState) => {
  const dispatch = useAppDispatch();
  const [shareConfirmVisible, setShareConfirmVisible] =
    useState<boolean>(false);
  const [shareRequestLoading, setShareRequestLoading] =
    useState<boolean>(false);

  const {
    commentSessionOpen: { postId: currentCommentOpenPostId },
    fetchingStatus,
  }: CommentsState = useSelector((state: RootState) => state.commentsState);
  const { session }: AuthState = useSelector((state: RootState) => state.auth);
  const { likeInsertStatus, likeDeleteStatus }: LikeState = useSelector(
    (state: RootState) => state.likeState
  );

  const toggleLike = async () => {
    if (!isLiked) {
      await dispatch(
        likePost({ post_id: postId, user_id: session?.user.DBID })
      );
      dispatch(setPostLiked({ postId: postId, isLiked: true }));
    } else {
      await dispatch(
        undoPostLike({ post_id: postId, user_id: session?.user.DBID })
      );
      dispatch(setPostLiked({ postId: postId, isLiked: false }));
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

  const handelShareConfirmClick = async () => {
    try {
      setShareRequestLoading(true);
      await shareAPI.insertPostShare({
        user_id: session?.user.DBID,
        post_id: postId,
      });
      dispatch(setPostShared({ postId: postId, isShared: true }));
      dispatch(
        notifyRequestStatus({
          severity: "success",
          message: "Share this post successfully !",
        })
      );
    } catch (rejectedValue) {
      dispatch(
        notifyRequestStatus({
          severity: "error",
          message: "Something's wrong, please try again !",
        })
      );
    }
    setShareRequestLoading(false);
  };

  return (
    <div className={styles.interactionMetrics}>
      {likeInsertStatus == "pending" || likeDeleteStatus == "pending" ? (
        <AppButtonLoading color={"primary"} />
      ) : (
        <div className={styles.metric}>
          <LikeIcon onClick={toggleLike} liked={isLiked} />
          <Text css={{ fontSize: "small" }}>{showNum(likedCount)}</Text>
        </div>
      )}
      {fetchingStatus == "pending" ? (
        <AppButtonLoading color={"primary"} />
      ) : (
        <div className={styles.metric} onClick={handleModeCommentClick}>
          <ModeCommentOutlined />
          <Text css={{ fontSize: "small" }}>{showNum(commentCount)}</Text>
        </div>
      )}
      <ConfirmModal
        trigger={
          <div
            className={styles.metric}
            onClick={() => {
              setShareConfirmVisible(true);
            }}
          >
            <ScreenShareOutlined htmlColor={isShared && appColors.primary} />
            <Text css={{ fontSize: "small" }}>{showNum(sharedCount)}</Text>
          </div>
        }
        title={"Share this post !"}
        description={
          "This post will be shared to your profile page, and will be displayed in your followers feed."
        }
        visible={shareConfirmVisible}
        setVisible={setShareConfirmVisible}
        onConfirmClick={handelShareConfirmClick}
        onCloseClick={() => {
          setShareConfirmVisible(false);
        }}
        loading={shareRequestLoading}
      />
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

const CommentArea = ({ postState, avatar }: CommentAreaProps) => {
  const dispatch = useAppDispatch();
  const [input, setInput] = useState<string>("");
  const {
    commentSessionOpen: { postId: currentCommentOpenPostId },
    comments,
    insertStatus,
    fetchingStatus,
    repliesFetchStatus,
  }: CommentsState = useSelector((state: RootState) => state.commentsState);
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (
      currentCommentOpenPostId == postState.id &&
      fetchingStatus == "success" &&
      comments.length > 0 &&
      repliesFetchStatus != "success"
    ) {
      const repliesFetchRequest = comments.map(
        (com) => ({ comment_id: com.id } as ReplyCommentsFetchRequestDto)
      );
      dispatch(fetchReplyCommentsOfCurrentComments(repliesFetchRequest));
    }
  }, [currentCommentOpenPostId, fetchingStatus, comments, repliesFetchStatus]);

  const handleSendClick = async () => {
    const trimInput = input.trim();
    if (trimInput.length > 0) {
      await dispatch(
        addComment({
          postId: postState.id,
          userId: session?.user.DBID,
          text: trimInput,
        })
      );
      dispatch(increaseCommentCountOfPost(postState.id));
      await dispatch(fetchCommentsByPostID({ postId: postState.id }));
      dispatch(openCommentSession({ postId: postState.id }));
    }
    setInput("");
  };

  const handleInputKeyDown = (e: KeyboardEvent<FormElement>) => {
    if (e.key == "Enter") {
      handleSendClick();
    }
  };

  const handleInputFocus = () => {
    dispatch(closeReplyInputOpen());
  };

  return (
    <div className={styles.commentArea}>
      <CommentInput
        avatar={avatar}
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        onSendClick={handleSendClick}
        onInputFocus={handleInputFocus}
        onInputKeydown={handleInputKeyDown}
        insertStatus={insertStatus}
      />
      {currentCommentOpenPostId == postState.id && (
        <div className={styles.commentThreads}>
          {comments.map((thread) => (
            <CommentThread
              key={thread.id}
              commentState={thread}
              postState={postState}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentInput = ({
  avatar,
  value,
  onChange,
  onSendClick,
  onInputFocus,
  onInputKeydown,
  insertStatus,
  onInputBlur,
  autoInputFocus,
}: CommentInputProps): ReactElement => {
  return (
    <div className={styles.commentInput}>
      <Avatar className={styles.commentInputAvatar} src={avatar} rounded />
      <Input
        className={styles.commentInputBox}
        placeholder="Write Your comment"
        value={value}
        onChange={onChange}
        onFocus={onInputFocus}
        onKeyDown={onInputKeydown}
        onBlur={onInputBlur}
        autoFocus={autoInputFocus}
        disabled={insertStatus == "pending"}
      />
      {insertStatus == "pending" ? (
        <AppButtonLoading />
      ) : (
        <Send
          cursor="pointer"
          htmlColor={appColors.primary}
          onClick={onSendClick}
        />
      )}
    </div>
  );
};

const CommentThread = (props: CommentThreadProps) => {
  const dispatch = useAppDispatch();
  const [input, setInput] = useState<string>("");
  const [isRepliesShow, toggleShowReplies] = useState<boolean>(false);

  const {
    commentState: { id: currentCommentId, owner, text, createdAt, replies },
    postState: { id: postId },
  } = props;
  const {
    comments,
    replyInputOpenWithCommentId,
    replyInsertStatus,
  }: CommentsState = useSelector((state: RootState) => state.commentsState);
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (replyInputOpenWithCommentId == currentCommentId) {
      setInput("");
    }
  }, [replyInputOpenWithCommentId, currentCommentId, setInput]);

  const handleReplyClick = () => {
    if (replyInputOpenWithCommentId != currentCommentId) {
      dispatch(openReplyInputOpenWithCommentId(currentCommentId));
    }
  };

  const handleInputKeyDown = async (e: KeyboardEvent<FormElement>) => {
    if (e.key == "Enter") {
      await handleSendClick();
      dispatch(closeReplyInputOpen());
    }
  };

  const handleSendClick = async () => {
    const trimInput = input.trim();
    if (trimInput.length > 0) {
      await dispatch(
        addReplyComment({
          postId: postId,
          userId: session?.user.DBID,
          text: trimInput,
          threadId: currentCommentId,
        })
      );
      dispatch(increaseCommentCountOfPost(postId));

      const repliesFetchRequest = comments.map(
        (com) => ({ comment_id: com.id } as ReplyCommentsFetchRequestDto)
      );
      await dispatch(fetchReplyCommentsOfCurrentComments(repliesFetchRequest));
      toggleShowReplies(true);
    }
    setInput("");
  };

  const handleInputBlur = () => {
    dispatch(closeReplyInputOpen());
  };

  return (
    <div className={styles.commentThread}>
      <ProfileLink
        profileId={owner.id}
        child={<Avatar pointer src={owner.image} />}
      />
      <div className={styles.commentThreadColumn}>
        <div className={styles.comment}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ProfileLink
              sessionId={session?.user.DBID}
              profileId={owner.id}
              child={
                <Text small css={{ fontWeight: "bold", cursor: "pointer" }}>
                  {owner.username}
                </Text>
              }
            />
            <SmallGreyText text={owner.shortBio} />
          </div>
          <Text small>{text}</Text>
        </div>
        <div className={styles.commentInteraction}>
          <Text size={11} css={{ cursor: "pointer" }}>
            Like
          </Text>
          <Text
            size={11}
            css={{ cursor: "pointer" }}
            onClick={handleReplyClick}
          >
            Reply
          </Text>
          <Text size={11}>{showFullLocaleDateTime(createdAt)}</Text>
        </div>
        {currentCommentId == replyInputOpenWithCommentId && (
          <CommentInput
            avatar={session?.user.image}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onSendClick={handleSendClick}
            onInputKeydown={handleInputKeyDown}
            onInputBlur={handleInputBlur}
            autoInputFocus={true}
            insertStatus={replyInsertStatus}
          />
        )}
        {replies?.length > 0 && !isRepliesShow && (
          <SmallGreyText
            text="Show reply comments"
            styles={{ marginLeft: "0.5rem", cursor: "pointer" }}
            onClick={() => toggleShowReplies((prev) => !prev)}
          />
        )}
        {replies?.length > 0 && isRepliesShow && (
          <div className={styles.replies}>
            {replies.map((reply) => (
              <Comment key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Comment = (props: CommentProps) => {
  const {
    reply: {
      owner: { id, image, username, shortBio },
      text,
      createdAt,
    },
  } = props;
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  return (
    <div className={styles.commentThread}>
      <ProfileLink
        sessionId={session?.user.DBID}
        profileId={id}
        child={<Avatar pointer src={image} />}
      />
      <div className={styles.commentThreadColumn}>
        <div className={styles.comment}>
          <div
            style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
          >
            <ProfileLink
              sessionId={session?.user.DBID}
              profileId={id}
              child={
                <Text small css={{ fontWeight: "bold", cursor: "pointer" }}>
                  {username}
                </Text>
              }
            />
            <SmallGreyText text={shortBio} />
          </div>
          <Text small>{text}</Text>
        </div>
        <div className={styles.commentInteraction}>
          <Text size={12} css={{ cursor: "pointer" }}>
            Like
          </Text>
          <Text size={12} css={{ cursor: "pointer" }}>
            Reply
          </Text>
          <Text size={11}>{showFullLocaleDateTime(createdAt)}</Text>
        </div>
      </div>
    </div>
  );
};
