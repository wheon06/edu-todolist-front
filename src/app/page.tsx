'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [ALL, setALL] = useState(true);
  const [ACTIVE, setACTIVE] = useState(false);
  const [COMPLETED, setCOMPLETED] = useState(false);
  const [arrayToggle, setArrayToggle] = useState(false);

  const [openTodoIndex, setOpenTodoIndex] = useState<{
    updateState: boolean;
    index: number | null;
  }>({ updateState: false, index: null });
  const [updatedText, setUpdatedText] = useState('');

  const [todos, setTodos] = useState<Todo[] | null>(null);

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
    async function loadData() {
      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const getTodoData = await getTodoFetch('/todo', options);
      setTodos(getTodoData);
    }
    loadData();
  }, []);

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
    setOpenTodoIndex({ updateState: true, index: index });
  };

  if (todos === null) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <h1 className='text-[100px]'>Loding...</h1>
      </div>
    );
  }

  const addTodoHandle = () => {
    filteredTodos.push();
  };

  const submitEditedContent = (index: number) => {
    if (updatedText === '') {
      setOpenTodoIndex({ updateState: false, index: null });
      console.log(openTodoIndex);
      return;
    }
    setTodos(
      todos.map((todo) => {
        if (todo.id === index) {
          return {
            ...todo,
            content: updatedText,
          };
        }
        return todo;
      }),
    );
    setUpdatedText('');
    setOpenTodoIndex({ updateState: false, index: null });
  };

  const filteredTodos = COMPLETED
    ? todos.filter((todo) => todo.isChecked)
    : ACTIVE
      ? todos.filter((todo) => !todo.isChecked)
      : todos;

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-300'>
      <div className='flex h-[700px] w-[400px] flex-col rounded-3xl bg-orange-400 shadow-2xl'>
        <div className='flex w-full flex-col items-center'>
          <div className='mb-24 mt-10 flex w-full flex-col items-center'>
            <h3 className='relative text-[28px] font-bold'>2024-08-13</h3>
            <div className='absolute mt-2 flex gap-1 font-bold'>
              <div className='mt-9 h-14 w-14 rounded-lg bg-black text-center text-[40px] text-white'>
                1
              </div>
              <div className='mt-9 h-14 w-14 rounded-lg bg-black text-center text-[40px] text-white'>
                2
              </div>
              <div className='h-14 w-7 rounded-lg text-center text-[80px] text-black'>
                :
              </div>
              <div className='mt-9 h-14 w-14 rounded-lg bg-black text-center text-[40px] text-white'>
                3
              </div>
              <div className='mt-9 h-14 w-14 rounded-lg bg-black text-center text-[40px] text-white'>
                8
              </div>
            </div>
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
              <button className='w-10 rounded-lg bg-gray-800 p-2 text-white'>
                &lt;
              </button>
              <h2 className='text-[26px] text-white'>8월</h2>
              <button className='w-10 rounded-lg bg-gray-800 p-2 text-white'>
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
              className={`${todo.isChecked ? 'mt-2 flex h-12 w-full items-center rounded-lg bg-green-400 hover:bg-green-600 hover:text-white' : 'mt-2 flex h-12 w-full items-center rounded-lg bg-orange-300 hover:bg-gray-500 hover:text-white'}`}
            >
              <input
                type='checkbox'
                className='ml-2 cursor-pointer rounded-sm checked:bg-green-500'
                checked={todo.isChecked}
                onChange={() => {
                  setTodos(
                    todos.map((t, i) =>
                      i === index ? { ...t, checked: !t.isChecked } : t,
                    ),
                  );
                }}
              />
              <div
                onClick={() => openTodoHandle(index)}
                className='ml-2 flex h-full w-full items-center pr-6'
              >
                {openTodoIndex.updateState && openTodoIndex.index === index ? (
                  <div className='flex h-full w-full py-2'>
                    <input
                      className='mr-1 h-full w-56 rounded-lg'
                      value={updatedText}
                      onChange={(e) => setUpdatedText(e.target.value)}
                    />
                    <button
                      onClick={() => submitEditedContent(index)}
                      className='mr-1 h-full w-14 rounded-lg bg-green-500'
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        //삭제로직

                        setOpenTodoIndex({ updateState: false, index: null });
                        console.log(todos);
                      }}
                      className='h-full w-14 rounded-lg bg-red-500'
                    >
                      삭제
                    </button>
                  </div>
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
