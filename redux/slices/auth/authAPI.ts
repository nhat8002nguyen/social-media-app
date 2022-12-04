import { hasuraAxios } from "utils/axios/axios";

export interface UserRequestDto {
  username: string;
  email: string;
  password: string;
  phone?: string;
  image: string;
  googleAccountID: string;
  about?: string;
}

export interface SyncUserResponseDto {
  user?: Array<UserResponseDto>;
  insert_user_one?: UserResponseDto;
}

interface UserResponseDto {
  id: number;
  user_name: String;
  email: String;
  password: String;
  phone: String | null;
  image: String | null;
  about: String | null;
  updated_at: String;
  created_at: String;
  google_account_id: String | null;
}

export const addGoogleAccountToDBIfNotExist = async (
  user: UserRequestDto
): Promise<SyncUserResponseDto> => {
  try {
    const checkAccountRes = await hasuraAxios.get("/users/google-account-id", {
      params: {
        google_id: user.googleAccountID,
      },
    });

    const { user: responseUser } = checkAccountRes.data;

    if (responseUser != null && responseUser.length > 0) {
      return checkAccountRes.data;
    }

    const syncAccountRes = await hasuraAxios.post("/auth/register", null, {
      params: {
        user_name: user.username,
        email: user.email,
        password: user.password,
        phone: user.phone,
        image: user.image,
        google_account_id: user.googleAccountID,
      },
    });
    return syncAccountRes.data;
  } catch (e) {
    console.error(e);
  }
};
