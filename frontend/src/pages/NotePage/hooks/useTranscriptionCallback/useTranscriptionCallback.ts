import { useState, useCallback, useEffect, useRef } from 'react';

type UseTranscriptionCallbackReturn = {
  appendToDescriptionFn: ((text: string) => void) | null;
  setAppendToDescriptionFn: (
    fn: ((text: string) => void) | null,
    memoId?: number
  ) => void;
  setFocusedMemo: (memoId: number | null) => void;
  onTranscription: (text: string) => void;
};

/**
 * Custom hook that manages the transcription callback chain.
 *
 * Handles:
 * - Storing multiple appendToDescription callbacks from memos
 * - Tracking which memo textarea is currently focused
 * - Providing a wrapper callback that uses the focused memo's callback
 *   or falls back to the most recently registered one
 * - Logging for debugging
 */
export const useTranscriptionCallback = (): UseTranscriptionCallbackReturn => {
  const [appendToDescriptionFn, setAppendToDescriptionFn] = useState<
    ((text: string) => void) | null
  >(null);
  
  // Track all registered append functions by memo ID
  const appendFunctionsRef = useRef<Map<number, (text: string) => void>>(new Map());
  // Track which memo is currently focused
  const focusedMemoIdRef = useRef<number | null>(null);

  // Wrap setAppendToDescriptionFn to handle multiple memos
  // The fn parameter should be a function that takes (memoId, appendFn)
  const setAppendToDescriptionFnWithLogging = useCallback(
    (fn: ((text: string) => void) | null, memoId?: number) => {
      if (fn && memoId) {
        // Register this memo's append function
        appendFunctionsRef.current.set(memoId, fn);
        console.log(`📝 Registered append function for memo ${memoId}`);
        
        // Update the current callback to use the focused memo, or this one if none focused
        const focusedId = focusedMemoIdRef.current || memoId;
        const focusedFn = appendFunctionsRef.current.get(focusedId);
        if (focusedFn) {
          setAppendToDescriptionFn(() => focusedFn);
        }
      } else if (fn === null && memoId) {
        // Unregister this memo's append function
        appendFunctionsRef.current.delete(memoId);
        console.log(`📝 Unregistered append function for memo ${memoId}`);
        
        // If this was the focused memo, clear focus
        if (focusedMemoIdRef.current === memoId) {
          focusedMemoIdRef.current = null;
        }
        
        // Update to use another memo's function if available
        const remainingIds = Array.from(appendFunctionsRef.current.keys());
        if (remainingIds.length > 0) {
          const nextId = remainingIds[0];
          const nextFn = appendFunctionsRef.current.get(nextId);
          if (nextFn) {
            setAppendToDescriptionFn(() => nextFn);
          }
        } else {
          setAppendToDescriptionFn(null);
        }
      } else {
        // Legacy behavior: single function without memoId
        console.log('📝📝📝 NotePage: setAppendToDescriptionFn called!', {
          isFunction: typeof fn === 'function',
          isNull: fn === null,
          isUndefined: fn === undefined,
          fnPreview: fn?.toString().substring(0, 200),
        });
        setAppendToDescriptionFn(fn);
      }
    },
    []
  );
  
  // Function to set focused memo (called when textarea gets focus)
  const setFocusedMemo = useCallback((memoId: number | null) => {
    focusedMemoIdRef.current = memoId;
    if (memoId) {
      const focusedFn = appendFunctionsRef.current.get(memoId);
      if (focusedFn) {
        setAppendToDescriptionFn(() => focusedFn);
        console.log(`📝 Switched focus to memo ${memoId}`);
      }
    } else {
      // Clear focus - use the first available memo or null
      const remainingIds = Array.from(appendFunctionsRef.current.keys());
      if (remainingIds.length > 0) {
        const firstId = remainingIds[0];
        const firstFn = appendFunctionsRef.current.get(firstId);
        if (firstFn) {
          setAppendToDescriptionFn(() => firstFn);
        }
      } else {
        setAppendToDescriptionFn(null);
      }
    }
  }, []);
  

  // Create a wrapper callback that directly updates the textarea if appendToDescriptionFn isn't set
  // This is a fallback to ensure transcriptions don't get lost
  const onTranscription = useCallback(
    (text: string) => {
      console.log('🔵 onTranscriptionCallback called with:', text);

      if (
        appendToDescriptionFn &&
        typeof appendToDescriptionFn === 'function'
      ) {
        console.log('✅ Calling appendToDescriptionFn with:', text);
        try {
          appendToDescriptionFn(text);
          console.log('✅ appendToDescriptionFn executed successfully');
          return;
        } catch (err) {
          console.error('❌ Error calling appendToDescriptionFn:', err);
        }
      }

      // Fallback: directly update the textarea if callback isn't set
      console.warn(
        '⚠️ appendToDescriptionFn not set, trying direct textarea update'
      );
      const textarea = document.getElementById(
        'note-description'
      ) as HTMLTextAreaElement;
      if (textarea) {
        const currentValue = textarea.value || '';
        const separator = currentValue ? ' ' : '';
        const newValue = `${currentValue}${separator}${text.trim()}`;
        console.log('📝 Directly updating textarea:', {
          currentLength: currentValue.length,
          newLength: newValue.length,
        });

        // Update the textarea value
        textarea.value = newValue;

        // Trigger input event to notify React
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);

        // Also trigger change event
        const changeEvent = new Event('change', { bubbles: true });
        textarea.dispatchEvent(changeEvent);

        console.log('✅ Textarea updated directly');
      } else {
        console.error('❌ Textarea not found!');
      }
    },
    [appendToDescriptionFn]
  );

  // Log when appendToDescriptionFn is set
  useEffect(() => {
    console.log('📝 NotePage: appendToDescriptionFn updated', {
      isFunction: typeof appendToDescriptionFn === 'function',
      isNull: appendToDescriptionFn === null,
    });
  }, [appendToDescriptionFn]);

  return {
    appendToDescriptionFn,
    setAppendToDescriptionFn: setAppendToDescriptionFnWithLogging,
    setFocusedMemo,
    onTranscription,
  };
};
