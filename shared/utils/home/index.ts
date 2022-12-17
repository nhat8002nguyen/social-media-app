import { useState } from "react";
import { PostFormDetailState } from "redux/slices/home/posts/postFormSlice";
import { notifyRequestStatus } from "redux/slices/statusNotifications/snackbarsSlice";
import { useAppDispatch } from "redux/store/store";

export const validatePostValues = (
	postValues: PostFormDetailState, 
	setPostValues: ReturnType<typeof useState<PostFormDetailState>>[1],
	dispatch: ReturnType<typeof useAppDispatch>
	): Boolean => {
    let { userId, body, hotel } = postValues;
    if (userId < 0) {
      dispatch(
        notifyRequestStatus({
          message:
            "Current session is unauthenticated or outdated, please reload page !",
          severity: "error",
        })
      );
      return false;
    }
    if (body.length == 0) {
      dispatch(
        notifyRequestStatus({
          message: "Body should not empty, please fill it !",
          severity: "error",
        })
      );
      return false;
    }
    if (Number.isNaN(hotel)) {
      dispatch(
        notifyRequestStatus({
          message: "Hotel not found, please enter exiting hotel",
          severity: "error",
        })
      );

      setPostValues((prev) => ({ ...prev, hotel: 6 }));
			// workaround, have to remove this
			hotel = 6;
    }
    return true;
  };

export const generateRandom = (min = 0, max = 100) => {
    let difference = max - min;
    let rand = Math.random();
    rand = Math.floor( rand * difference);
    rand = rand + min;
    return rand;
}

export const showFullLocaleDateTime = (date: Date): string => {
		return date.toLocaleTimeString() + " " + date.toLocaleDateString().replaceAll("/", "-");
}

export const showNum = (num: number) => {
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