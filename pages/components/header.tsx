import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRecoilState } from "recoil";
import { userState } from "../../lib/atom";
import { auth } from "../../lib/firebase";

const Header = () => {
  const [user, setUser] = useRecoilState(userState);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setUser(null);
    return signOut(auth);
  };

  //ログイン状態の監視。ログインしていればユーザー情報を保存
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    });
  }, [user]);
  return (
    <div className="flex justify-between items-center px-5 py-5 border-b-2 border-b-gray-300">
      <Link href="/todos/">
        <h1 className="text-gray-800 font-bold text-4xl">Next-Todo</h1>
      </Link>
      <div className="flex justify-between items-center space-x-5">
        {isLoading ? (
          <>
            <Link
              href="/signin/"
              className="text-gray-700 px-5 py-2 border transition-all ease-in duration-150 border-gray hover:bg-gray-500 hover:text-white"
            >
              サインイン
            </Link>
            <Link
              href="/signup/"
              className="text-gray-700 px-5 py-2 border transition-all ease-in duration-150 border-gray hover:bg-gray-500 hover:text-white"
            >
              新規登録
            </Link>
          </>
        ) : (
          <>
            <p>
              ようこそ <span className="font-bold">{user?.displayName}</span>{" "}
              さん!
            </p>
            <button
              onClick={logout}
              className="text-gray-700 px-5 py-2 border transition-all ease-in duration-150 border-gray-700 hover:bg-gray-500 hover:text-white"
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
