import Head from "next/head";
import { useState, useEffect } from "react";
import Layout from "../components/layout";
import Link from "next/link";
import Router from "next/router";
import { useRecoilValue, useRecoilState } from "recoil";
import { userState, todosState } from "../../lib/atom";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const statusList = [
  { value: "no-yet", label: "未着手", color: "red" },
  { value: "start", label: "着手", color: "orange" },
  { value: "comp", label: "完了", color: "green" },
];

const TodoCreate: React.FC = () => {
  const user = useRecoilValue(userState);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState("no-yet");
  const [todos, setTodos] = useRecoilState(todosState);
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = ("0" + (today.getMonth() + 1)).slice(-2);
    const dd = ("0" + today.getDate()).slice(-2);
    return yyyy + "-" + mm + "-" + dd;
  };
  const getNextId = () => {
    return (
      Math.max.apply(
        null,
        todos.map((todo) => Number(todo.id))
      ) + 1
    );
  };
  const addTodo = () => {
    if (user) {
      addDoc(collection(db, "todos"), {
        id: "", //DBにはドキュメント毎にIDが割り振られているので空文字にする
        uid: user.uid,
        title: title,
        date: date,
        detail: detail,
        status: status,
      });
    } else {
      setTodos([
        ...todos,
        {
          //
          id: todos.length > 0 ? getNextId() : 0,
          uid: "",
          title: title,
          date: date,
          detail: detail,
          status: status,
        },
      ]);
    }
    setTitle("");
    setDate(getToday());
    setDetail("");
    setStatus("");
    Router.push("/todos");
  };
  useEffect(() => {
    setDate(getToday());
  }, []);
  return (
    <Layout>
      <>
        <Head>
          <title>タスク追加</title>
        </Head>
        <h2 className="text-4xl text-center font-bold mb-14">タスク追加</h2>
        <div className="w-2/5 flex flex-col space-x-2 items-center space-y-12">
          <div className="w-full flex space-x-5">
            <label className="w-1/5 block font-bold text-gray-700">
              タスク名
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="タスク名を入力してください"
              className="block mb-2 p-2 text-gray-700 border border-solid border-gray-200 rounded-md flex-1 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>
          <div className="w-full flex space-x-5">
            <label className="w-1/5 block font-bold text-gray-700">
              完了予定日
            </label>
            <input
              type="date"
              value={date}
              required
              onChange={(e) => setDate(e.target.value)}
              className="block mb-2 p-2 text-gray-700 border border-solid border-gray-200 rounded-md flex-1 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
            ></input>
          </div>
          <div className="w-full flex space-x-5">
            <label className="w-1/5 block font-bold text-gray-700">詳細</label>
            <textarea
              placeholder="詳細を入力してください"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="h-40 block mb-2 p-2 text-gray-700 border border-solid border-gray-200 rounded-md flex-1 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>
          <div className="w-full flex space-x-5">
            <label className="w-1/5 block font-bold text-gray-700">
              ステータス
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="block mb-2 p-2 text-gray-700 border border-solid border-gray-200 rounded-md flex-1 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
            >
              {statusList.map((status) => {
                return (
                  <option value={status.value} key={status.value}>
                    {status.label}
                  </option>
                );
              })}
            </select>
          </div>
          <Link
            href="/todos/create"
            className="bg-white border border-blue-500 text-blue-500 font-bold px-10 py-3 rounded-md flex flex-row justify-center items-center transition-all ease-in duration-150 hover:bg-blue-500 hover:text-white"
            onClick={addTodo}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            TODOを追加
          </Link>
        </div>
      </>
    </Layout>
  );
};

export default TodoCreate;
