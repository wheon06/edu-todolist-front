'use client';

import { useEffect, useState } from 'react';
import Clock from './component/clock';

export default function Home() {
  const [ALL, setALL] = useState(true);
  const [ACTIVE, setACTIVE] = useState(false);
  const [COMPLETED, setCOMPLETED] = useState(false);
  const [arrayToggle, setArrayToggle] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const [userData, setUserData] = useState<User>();

  const [openTodoIndex, setOpenTodoIndex] = useState<{
    updateState: boolean;
    index: number | null;
    isNew: boolean;
  }>({ updateState: false, index: null, isNew: false });
  const [updatedText, setUpdatedText] = useState('');

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [selectMonth, setSelectMonth] = useState<number>(new Date().getMonth());

  const [todos, setTodos] = useState<Todo[]>([]);

  async function getTodoFetch(url: string, options: any): Promise<any> {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      window.location.href = 'login';
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    let response = await fetch('http://localhost:4000' + url, options);

    if (response.status === 401) {
      const refreshResponse = await fetch(
        'http://localhost:4000/auth/refresh',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (refreshResponse.ok) {
        const { accessToken: newAccessToken } = await refreshResponse.json();
        localStorage.setItem('accessToken', newAccessToken);
        options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch('http://localhost:4000' + url, options);
      } else {
        throw new Error('Failed to refresh access token');
      }
    }

    return await response.json();
  }

  useEffect(() => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const getUserData = async () => {
      const userData = await getTodoFetch('/auth/userInfo', options);
      setUserData(userData);
    };

    const intervalid = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    async function loadData() {
      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const getTodoData = await getTodoFetch('/todo', options);
      console.log(getTodoData);
      setTodos(getTodoData);
    }

    getUserData();
    loadData();

    return () => clearInterval(intervalid);
  }, [trigger]);

  if (todos.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <h1 className='text-[100px]'>Loding...</h1>
      </div>
    );
  }

  const setAllHandle = () => {
    if (!(!ACTIVE && ALL && !COMPLETED)) setALL(!ALL);
    setACTIVE(false);
    setCOMPLETED(false);
  };

  const setACTIVEHandle = () => {
    setALL(false);
    if (!(ACTIVE && !ALL && !COMPLETED)) setACTIVE(!ACTIVE);
    setCOMPLETED(false);
  };

  const setCOMPLETEDHandle = () => {
    setALL(false);
    setACTIVE(false);
    if (!(!ACTIVE && !ALL && COMPLETED)) setCOMPLETED(!COMPLETED);
  };

  const arrayToggleHandle = () => {
    setArrayToggle(!arrayToggle);
  };

  const openTodoHandle = (index: number) => {
    if (openTodoIndex.updateState) return;
    setOpenTodoIndex({ updateState: true, index: index, isNew: false });
  };

  async function createTodoHandle(content: string) {
    if (content === '') return;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        isChecked: false,
      }),
    };

    await getTodoFetch('/todo/save', options);

    if (!userData) return;

    const newTodo = {
      id: -1,
      content: content,
      isChecked: false,
      updatedAt: new Date().toString(),
      userId: userData.id,
    };

    todos.shift();
    const updatedTodos = [newTodo, ...todos];
    setTodos(updatedTodos);
    setUpdatedText('');
    setOpenTodoIndex({ updateState: false, index: null, isNew: false });
    setTrigger((prev) => !prev);
  }

  async function addTodoHandle() {
    if (COMPLETED) return;
    if (!userData) return;
    if (openTodoIndex.updateState) return;

    const newTodo = {
      id: -1,
      content: '',
      isChecked: false,
      updatedAt: new Date().toString(),
      userId: userData.id,
    };
    const updatedTodos = [newTodo, ...todos];
    setTodos(updatedTodos);
    setOpenTodoIndex({ updateState: true, index: 0, isNew: true });
  }

  async function submitEditedContent(todos: Todo[], index: number) {
    if (updatedText === '') {
      setOpenTodoIndex({ updateState: false, index: null, isNew: false });
      return;
    }

    setOpenTodoIndex({ updateState: false, index: null, isNew: false });

    const updatedTodos = [...todos];
    index = filteredTodos[index].id;

    for (const updatedTodo of updatedTodos) {
      if (updatedTodo.id === index) {
        updatedTodo.content = updatedText;
      }
    }

    setTodos(updatedTodos);

    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: updatedText,
      }),
    };

    let targetId = -1;

    for (const updatedTodo of updatedTodos) {
      if (updatedTodo.id === index) {
        targetId = updatedTodo.id;
      }
    }

    await getTodoFetch('/todo/update/content/' + targetId, options);

    setUpdatedText('');
    setTrigger((prev) => !prev);
  }

  const filteredTodos = todos
    .filter((todo) => {
      if (!userData) return false;
      return userData.id === todo.userId;
    })
    .filter((todo) => !todo.deletedAt || new Date(todo.deletedAt) > new Date())
    .filter((todo) => {
      const updatedAt = new Date(todo.updatedAt ?? 0);
      return updatedAt.getMonth() === selectMonth;
    })
    .sort((a, b) => {
      if (a.id === -1) return -1;
      if (b.id === -1) return 1;
      const dateA = new Date(a.updatedAt ?? 0).getTime();
      const dateB = new Date(b.updatedAt ?? 0).getTime();
      return arrayToggle ? dateA - dateB : dateB - dateA;
    })
    .filter((todo) => {
      if (COMPLETED) {
        return todo.isChecked;
      } else if (ACTIVE) {
        return !todo.isChecked;
      } else {
        return true;
      }
    });

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-300'>
      <title>Todo | HOME</title>
      <div className='flex h-[700px] w-[400px] flex-col rounded-3xl bg-orange-400 shadow-2xl'>
        <div className='flex w-full flex-col items-center'>
          <a
            href='/login'
            className='ml-72 mr-2 mt-2 rounded-lg bg-red-500 p-2 text-right text-white hover:bg-red-700'
          >
            로그아웃
          </a>
          <div className='mb-24 flex w-full flex-col items-center'>
            <h3 className='relative text-[28px] font-bold'>
              {currentDate.getFullYear().toString() +
                '-' +
                (currentDate.getMonth() + 1).toString().padStart(2, '0') +
                '-' +
                currentDate.getDate().toString().padStart(2, '0')}
            </h3>
            <Clock currentDate={currentDate} />
          </div>
          <div className='flex w-full justify-between px-3'>
            <div className='flex gap-1'>
              <button
                onClick={() => setAllHandle()}
                className={`flex h-10 items-center justify-center p-3 ${
                  ALL
                    ? 'border-2 bg-red-400 text-white'
                    : 'bg-gray-600 bg-opacity-60'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setACTIVEHandle()}
                className={`flex h-10 items-center justify-center p-3 ${
                  ACTIVE
                    ? 'border-2 bg-red-400 text-white'
                    : 'bg-gray-600 bg-opacity-60'
                }`}
              >
                ACTIVE
              </button>
              <button
                onClick={() => setCOMPLETEDHandle()}
                className={`flex h-10 items-center justify-center p-3 ${
                  COMPLETED
                    ? 'border-2 bg-red-400 text-white'
                    : 'bg-gray-600 bg-opacity-60'
                }`}
              >
                COMPLETED
              </button>
            </div>
            <button
              onClick={() => addTodoHandle()}
              className='flex h-10 items-center justify-center rounded-lg bg-gray-800 p-3 text-white'
            >
              ADD
            </button>
          </div>
          <div className='flex w-full justify-center'>
            <div className='relative mt-5 flex gap-1'>
              <button
                onClick={() => {
                  if (selectMonth > 0) setSelectMonth(selectMonth - 1);
                }}
                className='w-10 rounded-lg bg-gray-800 p-2 text-white'
              >
                &lt;
              </button>
              <h2 className='text-[26px] text-white'>
                {selectMonth + 1 + '월'}
              </h2>
              <button
                onClick={() => {
                  if (selectMonth < 11) setSelectMonth(selectMonth + 1);
                }}
                className='w-10 rounded-lg bg-gray-800 p-2 text-white'
              >
                &gt;
              </button>
            </div>
            <div
              onClick={() => arrayToggleHandle()}
              className='absolute ml-72 flex cursor-pointer'
            >
              <div className='mt-5 h-10 w-20 rounded-full bg-gray-300'>
                <div
                  className={`${
                    arrayToggle ? 'flex justify-end' : 'flex justify-start'
                  }`}
                >
                  <div className='h-10 w-10 rounded-full bg-gray-800' />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='mb-3 mt-3 h-full w-full overflow-scroll rounded-lg p-2 scrollbar-hide'>
          {filteredTodos.map((todo: Todo, index) => (
            <div
              key={index}
              className={`${
                todo.isChecked
                  ? openTodoIndex.updateState
                    ? 'mt-2 flex h-12 w-full items-center rounded-lg bg-green-400 hover:bg-green-600'
                    : 'mt-2 flex h-12 w-full items-center rounded-lg bg-green-400 hover:bg-green-600 hover:text-white'
                  : openTodoIndex.updateState
                    ? 'mt-2 flex h-12 w-full items-center rounded-lg bg-orange-300 hover:bg-gray-500'
                    : 'mt-2 flex h-12 w-full items-center rounded-lg bg-orange-300 hover:bg-gray-500 hover:text-white'
              }`}
            >
              <input
                type='checkbox'
                className='ml-2 cursor-pointer rounded-sm checked:bg-green-500'
                checked={todo.isChecked}
                onChange={async () => {
                  index = filteredTodos[index].id;
                  const updatedTodos = [...todos];

                  for (const updatedTodo of updatedTodos) {
                    if (updatedTodo.id === index) {
                      updatedTodo.isChecked = !updatedTodo.isChecked;
                    }
                  }

                  setTodos(updatedTodos);

                  const options = {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      isChecked: todo.isChecked,
                    }),
                  };

                  try {
                    await getTodoFetch(
                      '/todo/update/isChecked/' + todo.id,
                      options,
                    );
                  } catch {
                    return;
                  }
                }}
              />
              <div
                onClick={() => openTodoHandle(index)}
                className='ml-2 flex h-full w-full items-center pr-6'
              >
                {openTodoIndex.updateState && openTodoIndex.index === index ? (
                  !openTodoIndex.isNew ? (
                    <div className='flex h-full w-full py-2'>
                      <input
                        className='mr-1 h-full w-56 rounded-lg'
                        placeholder={todo.content}
                        onChange={(e) => setUpdatedText(e.target.value)}
                      />
                      <button
                        onClick={() => submitEditedContent(todos, index)}
                        className='mr-1 h-full w-14 rounded-lg bg-green-500'
                      >
                        수정
                      </button>
                      <button
                        onClick={async () => {
                          const options = {
                            method: 'DELETE',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          };

                          await getTodoFetch(
                            '/todo/delete/' + todo.id,
                            options,
                          );

                          setTodos((prevTodos) =>
                            prevTodos.filter((t) => t.id !== todo.id),
                          );

                          setOpenTodoIndex({
                            updateState: false,
                            index: null,
                            isNew: false,
                          });

                          setTrigger((prev) => !prev);
                        }}
                        className='h-full w-14 rounded-lg bg-red-500'
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <div className='flex h-full w-full py-2'>
                      <input
                        className='mr-1 h-full w-56 rounded-lg'
                        onChange={(e) => setUpdatedText(e.target.value)}
                      />
                      <button
                        onClick={() => createTodoHandle(updatedText)}
                        className='mr-1 h-full w-14 rounded-lg bg-green-500'
                      >
                        등록
                      </button>
                      <button
                        onClick={() => {
                          todos.shift();

                          setOpenTodoIndex({
                            updateState: false,
                            index: null,
                            isNew: false,
                          });
                        }}
                        className='h-full w-14 rounded-lg bg-red-500'
                      >
                        취소
                      </button>
                    </div>
                  )
                ) : (
                  <div>
                    <h2 className=''>{todo.content}</h2>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
