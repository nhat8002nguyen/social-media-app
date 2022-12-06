import {
  Action,
  AnyAction,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import { useDispatch } from "react-redux";
import authSliceReducer from "redux/slices/auth/authSlice";
import commentsReducer from "redux/slices/home/comments/commentsSlice";
import recommendUserList from "redux/slices/home/followableUsers/recommendUserListSlice";
import likeReducer from "redux/slices/home/likes/likeSlice";
import postFormReducer from "redux/slices/home/posts/postFormSlice";
import postListReducer from "redux/slices/home/posts/postListSlice";
import snackbarsReducer from "redux/slices/statusNotifications/snackbarsSlice";

const combinedReducer = combineReducers({
  auth: authSliceReducer,
  postList: postListReducer,
  postForm: postFormReducer,
  snackbar: snackbarsReducer,
  recommendUserList: recommendUserList,
  commentsState: commentsReducer,
  likeState: likeReducer,
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
