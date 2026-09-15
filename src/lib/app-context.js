"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { subscribePosts, subscribeBoards } from "./store";

const AppContext = createContext(null);

/**
 * Holds the two live lists the whole app reads from (pins + collections),
 * the shared search phrase, and the state of the global Create dialogs, so
 * any screen can open them.
 *
 * Both sides mount it: the admin shell and the public archive. The public
 * routes simply never render the Create dialogs, so those fields sit
 * unused there.
 */
export function AppDataProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [boards, setBoards] = useState([]);
  const [ready, setReady] = useState(false);
  const [dataError, setDataError] = useState("");

  const [uploadState, setUploadState] = useState({ open: false, boardId: null });
  const [boardState, setBoardState] = useState({ open: false, board: null });
  const [query, setQuery] = useState("");

  useEffect(() => {
    let gotPosts = false;
    let gotBoards = false;
    const markReady = () => gotPosts && gotBoards && setReady(true);

    // A Firestore error here is almost always the security rules not being
    // published yet, so it is surfaced rather than left as an empty feed.
    // Visitors see this banner too, hence the "if you are the administrator".
    const onError = (err) => {
      setDataError(
        err?.code === "permission-denied"
          ? "The database refused that request. If you are the administrator, publish the rules from firestore.rules in the Firebase console."
          : err?.message || "Could not reach the database."
      );
      gotPosts = true;
      gotBoards = true;
      setReady(true);
    };

    const unsubPosts = subscribePosts((rows) => {
      setPosts(rows);
      gotPosts = true;
      markReady();
    }, onError);
    const unsubBoards = subscribeBoards((rows) => {
      setBoards(rows);
      gotBoards = true;
      markReady();
    }, onError);

    return () => {
      unsubPosts?.();
      unsubBoards?.();
    };
  }, []);

  const openUpload = useCallback(
    (boardId = null) => setUploadState({ open: true, boardId }),
    []
  );
  const closeUpload = useCallback(() => setUploadState({ open: false, boardId: null }), []);
  const openCreateBoard = useCallback(() => setBoardState({ open: true, board: null }), []);
  const openEditBoard = useCallback((board) => setBoardState({ open: true, board }), []);
  const closeBoard = useCallback(() => setBoardState({ open: false, board: null }), []);

  /** How many pins sit in each collection, and a cover image for it. */
  const boardStats = useMemo(() => {
    const stats = {};
    for (const board of boards) stats[board.id] = { count: 0, covers: [] };
    for (const post of posts) {
      for (const id of post.boardIds || []) {
        if (!stats[id]) continue;
        stats[id].count += 1;
        if (stats[id].covers.length < 3) stats[id].covers.push(post);
      }
    }
    return stats;
  }, [posts, boards]);

  const value = useMemo(
    () => ({
      posts,
      boards,
      boardStats,
      ready,
      dataError,
      query,
      setQuery,
      uploadState,
      boardState,
      openUpload,
      closeUpload,
      openCreateBoard,
      openEditBoard,
      closeBoard,
    }),
    [
      posts,
      boards,
      boardStats,
      ready,
      dataError,
      query,
      uploadState,
      boardState,
      openUpload,
      closeUpload,
      openCreateBoard,
      openEditBoard,
      closeBoard,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppDataProvider>");
  return ctx;
}
