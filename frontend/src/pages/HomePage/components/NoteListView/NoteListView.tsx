import React, { useCallback, useRef } from "react";
import { useNotes } from "../../hooks/useNotes";
import { NoteItem } from "./NoteItem/NoteItem";
import { SearchBar } from "./SearchBar/SearchBar";
import styles from "./NoteListView.module.css";

const LoadingSpinner: React.FC = () => (
  <div className={styles.loadingSpinner}>Loading...</div>
);

const NoMoreNotes: React.FC = () => (
  <div className={styles.noMoreNotes}>No more notes to load</div>
);

export const NoteListView: React.FC = () => {
  const { 
    notes, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    hasPendingChanges,
    searchNotes,
    clearSearch,
    searchQuery
  } = useNotes();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const threshold = 100; // pixels from bottom to trigger load

    // Check if we're near the bottom
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      console.log('Loading more...'); // Debug log
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  // Add scroll event listener
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollHandler = () => {
      requestAnimationFrame(handleScroll);
    };

    scrollContainer.addEventListener('scroll', scrollHandler);
    return () => scrollContainer.removeEventListener('scroll', scrollHandler);
  }, [handleScroll]);

  if (isLoading && notes.length === 0) {
    return <div className={styles.noteListLoading}>Loading notes...</div>;
  }

  if (error) {
    return <div className={styles.noteListError}>{error}</div>;
  }


  return (
    <div className={styles.noteList}>
      <div className={styles.noteListHeader}>
        <SearchBar 
          value={searchQuery}
          onChange={searchNotes}
          onClear={clearSearch}
        />
      </div>
      <div className={styles.noteListContent}>
        {hasPendingChanges && (
          <div className={styles.offlineNotice}>
            You have pending changes that will sync when you're back online.
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className={styles.noteListScrollContainer}
        >
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
          {isLoading && <LoadingSpinner />}
          {!hasMore && <NoMoreNotes />}
        </div>
      </div>
    </div>
  );
};
