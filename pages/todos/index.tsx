import Head from "next/head";
import Layout from "../components/layout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { todosState, userState } from "../../lib/atom";
import { db, auth } from "../../lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/**
 * TailwindCSSはクラス名を抽出して必要なもののみ抽出してCSSを作成する。
 * 変数を使用したり、文字列の補完したりしていると抽出されない。
 * そのため、このページでのみstatusListの各オブジェクトに使用するクラス名を格納する
 * （連想配列で新規に作ってもよいが、その場合status.valueの値がキーとして存在するかのチェックが入るため、帰って複雑になる）
 */
const statusList = [
  {
    value: "all",
    label: "すべて",
    color: "gray",
    bgColor: "bg-gray-500",
    borderColor: "border-gray-500",
    textColor: "text-gray-500",
    hoverBgColor: "hover:bg-gray-500",
  },
  {
    value: "no-yet",
    label: "未着手",
    color: "red",
    bgColor: "bg-red-500",
    borderColor: "border-red-500",
    textColor: "text-red-500",
    hoverBgColor: "hover:bg-red-500",
  },
  {
    value: "start",
    label: "着手",
    color: "orange",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-500",
    textColor: "text-orange-500",
    hoverBgColor: "hover:bg-orange-500",
  },
  {
    value: "comp",
    label: "完了",
    color: "green",
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
    textColor: "text-green-500",
    hoverBgColor: "hover:bg-green-500",
  },
];

const getStatusLabel = (value: string) => {
  const status = statusList.find((status) => status.value === value);
  return status?.label;
};
const getStatusColor = (value: string) => {
  const status = statusList.find((status) => status.value === value);
  return status?.color;
};
const Todos: React.FC = () => {
  const user = useRecoilValue(userState);
  const storeTodos = useRecoilValue(todosState);
  const [todos, setTodos] = useState(storeTodos);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [filterdTodos, setFilterdTodos] = useState(todos);
  const [isTodos, setIsTodos] = useState(false);
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setLoading(false);
      } else {
        setLoading(true);
      }
    });
  }, []);

  useEffect(() => {
    if (todos.length > 0) {
      setIsTodos(true);
    }
  }, [todos]);

  useEffect(() => {
    if (loading) {
      setTodos(storeTodos);
    } else {
      const q = query(collection(db, "todos"), where("uid", "==", user?.uid));
      onSnapshot(q, (snapshot) => {
        setTodos(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            uid: doc.data().uid,
            title: doc.data().title,
            date: doc.data().date,
            detail: doc.data().detail,
            status: doc.data().status,
          }))
        );
      });
    }
  }, [loading, storeTodos]);

  useEffect(() => {
    const filteringTodos = () => {
      switch (filter) {
        case "all":
          setFilterdTodos(todos);
          break;
        default:
          setFilterdTodos(todos.filter((todo) => todo.status === filter));
          break;
      }
    };
    filteringTodos();
  }, [filter, todos]);
  return (
    <Layout>
      <>
        <Head>
          <title>タスク一覧</title>
        </Head>
        <div className="container space-y-16 flex flex-col items-center">
          <Link
            href="/todos/create"
            className="bg-white border border-blue-500 text-blue-500 font-bold px-10 py-3 rounded-md flex flex-row justify-center items-center transition-all ease-in duration-150 hover:bg-blue-500 hover:text-white"
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
            TODOを作成する
          </Link>
          <div className="w-full space-y-10">
            <h2 className="text-4xl text-center font-bold">タスク一覧</h2>
            <div className="flex items-center justify-center space-x-5">
              {statusList.map((status) => {
                if (status.value != filter) {
                  return (
                    <button
                      className={`bg-white border ${status.borderColor} ${status.textColor} font-bold px-10 py-3 rounded-md flex flex-row justify-center items-center transition-all ease-in duration-150 ${status.hoverBgColor} hover:text-white`}
                      onClick={() => setFilter(status.value)}
                      key={status.value}
                      style={{}}
                    >
                      {status.label}
                    </button>
                  );
                } else {
                  return (
                    <button
                      className={`${status.bgColor} border ${status.borderColor} text-white font-bold px-10 py-3 rounded-md flex flex-row justify-center items-center`}
                      onClick={() => setFilter(status.value)}
                      key={status.value}
                    >
                      {status.label}
                    </button>
                  );
                }
              })}
            </div>
            {isTodos ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-b-gray-300">
                    <th className="px-3 py-3">タスク名</th>
                    <th className="py-3">完了予定日</th>
                    <th className="py-3">詳細</th>
                    <th className="py-3">ステータス</th>
                    <th className="px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filterdTodos.map((todo) => {
                    return (
                      <tr key={todo.id}>
                        <td className="px-3 py-3">{todo.title}</td>
                        <td className="py-3">{todo.date}</td>
                        <td className="py-3">{todo.detail}</td>
                        <td className="py-3">
                          <div
                            className={`w-3/5 bg-white text-center border border-${getStatusColor(
                              todo.status
                            )}-500 text-${getStatusColor(
                              todo.status
                            )}-500 font-bold px-2 py-1 rounded-md`}
                          >
                            {getStatusLabel(todo.status)}
                          </div>
                        </td>
                        <td className="py-3">
                          <Link
                            href={`/todos/${todo.id}`}
                            className="w-3/5 border-2 border-gray-700 py-2 flex items-center justify-center font-bold transition-all ease-in duration-150 hover:bg-gray-700 hover:text-white"
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>タスクがありません</p>
            )}
          </div>
        </div>
      </>
    </Layout>
  );
};

export default Todos;
