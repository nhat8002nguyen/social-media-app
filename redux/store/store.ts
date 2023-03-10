import {
  Action,
  AnyAction,
  ThunkAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import { HYDRATE, createWrapper } from "next-redux-wrapper";
import { useDispatch } from "react-redux";
import {
  homeFeedListenerMiddleware,
  postListListenerMiddleware,
} from "redux/middlewares/evaluation_posts";
import authSliceReducer from "redux/slices/auth/authSlice";
import globalReducer from "redux/slices/global";
import commentsReducer from "redux/slices/home/comments/commentsSlice";
import recommendUserList from "redux/slices/home/followableUsers/recommendUserListSlice";
import likeReducer from "redux/slices/home/likes/likeSlice";
import postFormReducer from "redux/slices/home/posts/postFormSlice";
import postListReducer from "redux/slices/home/posts/postListSlice";
import summaryReducer from "redux/slices/profile/summary/summarySlice";
import {
  hotelSliceReducer,
  postSearchSliceReducer,
  userSearchSliceReducer,
} from "redux/slices/search";
import snackbarsReducer from "redux/slices/statusNotifications/snackbarsSlice";
import trendingSlice from "redux/slices/trending/trendingSlice";

const combinedReducer = combineReducers({
  global: globalReducer,
  auth: authSliceReducer,
  postList: postListReducer,
  postForm: postFormReducer,
  snackbar: snackbarsReducer,
  recommendUserList: recommendUserList,
  commentsState: commentsReducer,
  likeState: likeReducer,
  summaryState: summaryReducer,
  trendingState: trendingSlice,
  hotelSearch: hotelSliceReducer,
  postSearch: postSearchSliceReducer,
  userSearch: userSearchSliceReducer,
});

const reducer = (
  state: ReturnType<typeof combinedReducer>,
  action: AnyAction
) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload,
    };
    return nextState;
  } else {
    return combinedReducer(state, action);
  }
};

export const makeStore = () =>
  configureStore({
    reducer,
    devTools: process.env.NODE_ENV != "production",
    middleware(getDefaultMiddleware) {
      return getDefaultMiddleware().prepend(
        postListListenerMiddleware.middleware,
        homeFeedListenerMiddleware.middleware
      );
    },
  });

type Store = ReturnType<typeof makeStore>;

export type AppDispatch = Store["dispatch"];
export const useAppDispatch: () => AppDispatch = useDispatch;

export type RootState = ReturnType<Store["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const wrapper = createWrapper(makeStore, { debug: true });
