import Head from "next/head";
import { useState, useEffect } from "react";
import Layout from "../../components/layout";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState, todosState } from "../../../lib/atom";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface todo {
  id: string | number;
  uid: string | null;
  title: string;
  date: any;
  detail: string | null;
  status: string;
}

const statusList = [
  { value: "no-yet", label: "未着手", color: "red" },
  { value: "start", label: "着手", color: "orange" },
  { value: "comp", label: "完了", color: "green" },
];
const TodoEdit: React.FC = () => {
  const user = useRecoilValue(userState);
  const router = useRouter();
  const todoId = router.query.id;
  const [todos, setTodos] = useRecoilState(todosState);
  const [filterdTodo, setFilterdTodo] = useState<todo | undefined>({
    id: "",
    uid: null,
    title: "",
    date: null,
    detail: null,
    status: "",
  });
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState("");

  const updateTodos = () => {
    if (user) {
      const changeTodo = {
        id: todoId,
        uid: user.uid,
        title,
        date,
        detail,
        status,
      };
      const docRef = doc(db, "todos", String(todoId));
      const updateDocTodo = async () => {
        await setDoc(docRef, changeTodo);
      };
      updateDocTodo();
    } else {
      const changeTodo = {
        id: Number(todoId),
        uid: null,
        title,
        date,
        detail,
        status,
      };
      const newTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return changeTodo;
        } else {
          return todo;
        }
      });
      setTodos(newTodos);
    }
    Router.push(`/todos/${todoId}`);
  };

  //todosのみを第2引数にすると、todoId読み込み前に実行され undefinedになるためtodoIdもお指定する
  useEffect(() => {
    if (user) {
      const getDocTodo = async () => {
        const docRef = doc(db, "todos", String(todoId));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("a");
          setFilterdTodo({
            id: docSnap.id,
            uid: docSnap.data().uid,
            title: docSnap.data().title,
            date: docSnap.data().date,
            detail: docSnap.data().detail,
            status: docSnap.data().status,
          });
        }
      };
      getDocTodo();
    } else {
      setFilterdTodo(todos.find((todo) => todo.id === Number(todoId)));
    }
  }, [todoId, todos]);

  //filterdTodoの準備が完了したら、各フォーム用のステートをSETしていく
  useEffect(() => {
    console.log(filterdTodo);
    if (filterdTodo) {
      setTitle(filterdTodo.title);
      setDate(filterdTodo.date);
      if (filterdTodo.detail) {
        setDetail(filterdTodo.detail);
      }
      setStatus(filterdTodo.status);
    }
  }, [filterdTodo]);
  return (
    <Layout>
      <>
        <Head>
          <title>タスク編集</title>
        </Head>
        <h2 className="text-4xl text-center font-bold mb-14">タスク編集</h2>
        {filterdTodo ? (
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
              <label className="w-1/5 block font-bold text-gray-700">
                詳細
              </label>
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
            <div className="w-full flex justify-center items-center space-x-5">
              <button
                onClick={updateTodos}
                className="w-3/6 bg-white border border-blue-500 text-blue-500 font-bold px-10 py-3 rounded-md flex flex-row justify-center items-center transition-all ease-in duration-150 hover:bg-blue-500 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                更新
              </button>
              <Link
                href={`/todos/${todoId}`}
                className="w-3/6 bg-white border border-red-500 text-red-500 font-bold px-10 py-3 rounded-md flex flex-row justify-center items-center transition-all ease-in duration-150 hover:bg-red-500 hover:text-white"
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
                    d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
                  />
                </svg>
                キャンセル
              </Link>
            </div>
          </div>
        ) : (
          <div>Loading</div>
        )}
      </>
    </Layout>
  );
};

export default TodoEdit;
