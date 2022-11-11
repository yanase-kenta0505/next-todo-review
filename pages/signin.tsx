import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { app, auth } from "../lib/firebase";
import { useRecoilState } from "recoil";
import { userState } from "../lib/atom";
import Router from "next/router";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useRecoilState(userState);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);
    await signInWithPopup(auth, provider).catch((err) => alert(err.message));
  };

  const signInWithEmailPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("メールアドレスまたはパスワードが間違っています");
    }
  };

  //ログイン状態の監視。ログインしていればユーザー情報を保存
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);
  //ユーザー情報があればtodosに遷移させる
  useEffect(() => {
    if (user) {
      Router.push("/todos");
    }
  }, [user]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-3/6 max-w-md bg-white shadow-md min-h-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full space-y-8">
          <div>
            <h2 className="text-3xl text-center font-bold text-cyan-500">
              Sign In
            </h2>
          </div>
          <form
            className="flex-col space-y-5"
            onSubmit={(e) => signInWithEmailPassword(e)}
          >
            <input
              type="email"
              placeholder="E-mail Address"
              className="block w-full mb-2 p-2 text-gray-700 border border-solid border-gray-200  rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="block w-full mb-2 p-2 text-gray-700 border border-solid border-gray-200  rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full text-white bg-blue-500 py-2 px-5 rounded-md transition ease-in duration-150 hover:bg-blue-400">
              Sign in
            </button>
          </form>
          <button
            className="flex justify-center items-center w-full text-white bg-indigo-500 py-2 px-5 rounded-md transition ease-in duration-150 hover:bg-indigo-400"
            onClick={signInWithGoogle}
          >
            <Image
              src="/google.svg"
              alt="google icon"
              className="mr-1"
              width={20}
              height={20}
            />
            Sign in With Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
