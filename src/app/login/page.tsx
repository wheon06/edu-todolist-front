'use client';

import { useState } from 'react';

export default function Join() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        window.location.href = '/';
      } else if (response.status === 401) {
        alert('비밀번호를 확인해주세요');
      } else if (response.status === 404) {
        alert('존재하지 않는 유저입니다.');
      } else {
        alert('로그인 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 오류');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-300'>
      <div className='flex h-[500px] w-[400px] flex-col rounded-3xl bg-white p-4 shadow-2xl'>
        <h2 className='mb-14 mt-10 text-center text-[70px] font-bold'>TODO</h2>
        <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
          <input
            type='text'
            name='username'
            placeholder='아이디'
            required
            className='rounded-lg'
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type='password'
            name='password'
            placeholder='비밀번호'
            required
            className='rounded-lg'
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type='submit'
            className='h-12 cursor-pointer rounded-full bg-blue-500 text-white'
            value={'로그인'}
          />
        </form>
        <a
          href='/login'
          className='mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-gray-300'
        >
          회원가입
        </a>
      </div>
    </div>
  );
}
