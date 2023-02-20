/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/button-has-type */

import * as React from 'react';

import './styles.scss';

import BlockList from './BlockList';

const Options: React.FC = () => {
  return (
    <div className="flex justify-center align-middle w-full h-full 2xl:px-96 xl:px-80 lg:px-56 md:px-32 sm:px-12 px-4">
      <div className="flex-1 mt-12 max-w-4xl bg-gray-900">
        <h1 className=" mb-4 text-4xl font-extrabold leading-none tracking-tight text-white">
          Options
        </h1>

        <BlockList />
      </div>
    </div>
  );
};

export default Options;
