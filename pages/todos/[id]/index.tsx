import Head from "next/head";
import { useState, useEffect } from "react";
import Layout from "../../components/layout";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { useRecoilValue, useRecoilState } from "recoil";
import { userState, todosState } from "../../../lib/atom";
import { db } from "../../../lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

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
const getStatusLabel = (value: string) => {
  const status = statusList.find((status) => status.value === value);
  return status?.label;
};
const TodoDetail: React.FC = () => {
  const user = useRecoilValue(userState);
  const router = useRouter();
  const todoId = router.query.id;
  const [todos, setTodos] = useRecoilState(todosState);
  const [filterdTodo, setFilterdTodo] = useState<todo>();

  const deleteTodo = () => {
    if (user) {
      const docRef = doc(db, "todos", String(todoId));
      const deleteDocTodos = async () => {
        await deleteDoc(docRef);
      };
      deleteDocTodos();
    } else {
      const newTodos = todos.filter((todo) => {
        return todo.id != todoId;
      });
      setTodos(newTodos);
    }
    Router.push("/todos/");
  };

  //todosのみを第2引数にすると、todoId読み込み前に実行され undefinedになるためtodoIdもお指定する
  useEffect(() => {
    if (user) {
      const getDocTodos = async () => {
        const docRef = doc(db, "todos", String(todoId));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
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
      getDocTodos();
    } else {
      setFilterdTodo(todos.find((todo) => todo.id === Number(todoId)));
    }
  }, [todoId, todos]);
  return (
    <Layout>
      <>
        <Head>
          <title>タスク詳細</title>
        </Head>
        <h2 className="text-4xl text-center font-bold mb-14">タスク詳細画面</h2>
        {filterdTodo ? (
          <div className="w-2/5 flex flex-col space-x-2 items-center space-y-12">
            <div className="w-full flex space-x-5">
              <label className="w-1/5 block font-bold text-gray-700">
                タスク名
              </label>
              <p>{filterdTodo.title}</p>
            </div>
            <div className="w-full flex space-x-5">
              <label className="w-1/5 block font-bold text-gray-700">
                完了予定日
              </label>
              <p>{filterdTodo.date}</p>
            </div>
            <div className="w-full flex space-x-5">
              <label className="w-1/5 block font-bold text-gray-700">
                詳細
              </label>
              <p>{filterdTodo.detail}</p>
            </div>
            <div className="w-full flex space-x-5">
              <label className="w-1/5 block font-bold text-gray-700">
                ステータス
              </label>
              <p>{getStatusLabel(filterdTodo.status)}</p>
            </div>
            <div className="w-full flex justify-center items-center space-x-5">
              <Link
                href={`/todos/${filterdTodo.id}/edit`}
                className="w-3/6 bg-white border border-gray-500 text-gray-500 font-bold px-10 py-3 rounded-md flex flex-row justify-center items-center transition-all ease-in duration-150 hover:bg-gray-500 hover:text-white"
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
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                編集
              </Link>
              <button
                onClick={deleteTodo}
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
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
                削除
              </button>
            </div>
          </div>
        ) : (
          <div>Loading</div>
        )}
      </>
    </Layout>
  );
};

export default TodoDetail;
