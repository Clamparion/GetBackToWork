import React, {useState, useEffect} from 'react';
import {browser} from 'webextension-polyfill-ts';
import {BlockedSite} from '../Models/blocked-site';
import DeleteIconButton from '../UI/DeleteIconButton';
import {v4 as uuidv4} from 'uuid';

const BlockList: React.FC = () => {
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);

  useEffect(() => {
    browser.storage.sync
      .get('blockedSites')
      .then((response: unknown) =>
        setBlockedSites((response as any).blockedSites as BlockedSite[])
      );
  }, []);

  const setBlockedDomain = (id: string, newValue: string) => {
    setBlockedSites(
      blockedSites.map((bs) =>
        bs.id === id
          ? {
              ...bs,
              domain: newValue,
            }
          : {...bs}
      )
    );
  };

  const setBlockedTime = (id: string, newValue: string) => {
    setBlockedSites(
      blockedSites.map((bs) =>
        bs.id === id
          ? {
              ...bs,
              timeLimitInMinutes: +newValue,
            }
          : {...bs}
      )
    );
  };

  const removeBlockedSite = (id: string) => {
    setBlockedSites(blockedSites.filter((bs) => bs.id !== id));
  };

  const addBlockedSite = () => {
    const newBlockedSite = {
      domain: '',
      timeLimitInMinutes: 5,
      id: uuidv4(),
    } as BlockedSite;

    setBlockedSites([...blockedSites, newBlockedSite]);
  };

  React.useEffect(() => {
    const saveData = setTimeout(() => {
      browser.storage.sync
        .set({
          blockedSites: blockedSites
            .map((b) => {
              const blockedSite = b;

              blockedSite.domain = blockedSite.domain
                .replaceAll('https://', '')
                .replaceAll('http://', '')
                .replaceAll('www.', '')
                .replace(/\/$/, '');

              return blockedSite;
            })
            .filter((b) => b.domain.trim().length > 0),
        })
        .then(() => {});
    }, 200);

    return () => clearTimeout(saveData);
  }, [blockedSites]);

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold text-white">Blocked Domains</h2>
      <form>
        <div className="flex flex-col gap-2 mb-2">
          {blockedSites.map((blockedSite, index) => {
            return (
              <div key={blockedSite.id} className="flex gap-6 mb-6 flex-1">
                <div className="flex-1">
                  {index === 0 ? (
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-white"
                    >
                      Domains:
                    </label>
                  ) : (
                    <></>
                  )}
                  <div className="flex text-sm rounded-lg">
                    <span className="inline-flex items-center rounded-l-md border border-r-0  px-3 text-sm bg-gray-800 border-gray-600 text-gray-400">
                      https://
                    </span>
                    <input
                      type="text"
                      className="rounded-none rounded-r-md block w-full p-2.5 border bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="instagram.com"
                      value={blockedSite.domain}
                      autoComplete="off"
                      onChange={(event) =>
                        setBlockedDomain(blockedSite.id, event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  {index === 0 ? (
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-white"
                    >
                      Minutes:
                    </label>
                  ) : (
                    <></>
                  )}

                  <input
                    type="number"
                    className="sm:max-w-[100px]  max-w-[80px] text-sm rounded-lg border  block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                    value={blockedSite.timeLimitInMinutes}
                    onChange={(event) =>
                      setBlockedTime(blockedSite.id, event.target.value)
                    }
                    required
                  />
                </div>
                <div className="flex">
                  <DeleteIconButton
                    onClick={() => removeBlockedSite(blockedSite.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </form>
      <button
        onClick={() => addBlockedSite()}
        className="text-white focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center bg-green-600 hover:bg-green-700 focus:ring-green-800"
      >
        Add domain
      </button>
    </>
  );
};

export default BlockList;
