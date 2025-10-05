import React, { useEffect } from 'react';
import { Fab, CircularProgress, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/useAuth';
import { DesktopNoteListView } from './components/NoteListView/DesktopNoteListView/DesktopNoteListView';
import { useCreateNote } from './hooks/useCreateNote';
import { CreateNoteMenu } from './components/CreateNoteMenu/CreateNoteMenu';
import { Header } from '../../components/Header/Header';
import { Paper } from '@mui/material';
import { DesktopSidebar } from '../../components/Header/Sidebar/DesktopSidebar';
import { NOTE_TYPES } from '../../constant';
import { useLocation, useParams, useNavigate, Outlet } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileNoteListView } from './components/NoteListView/MobileNoteListVIew/MobileNoteListView';
import { ROUTES } from '../../constants/routes';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { createNote, isCreating } = useCreateNote();
  const [showMenu, setShowMenu] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeNoteId } = useParams<{ id: string }>();
  const [selectedNoteId, setSelectedNoteId] = React.useState<number | null>(
    routeNoteId ? Number(routeNoteId) : null
  );

  const noteType = location.pathname.split('/')[1];
  const noteTypeParam: 'MEMO' | 'CHECKLIST' | undefined =
    noteType === 'memos' ? 'MEMO' : noteType === 'checklists' ? 'CHECKLIST' : undefined;
  const { tagId } = useParams<{ tagId: string }>();

  // Update selectedNoteId when route changes
  useEffect(() => {
    if (routeNoteId) {
      setSelectedNoteId(Number(routeNoteId));
    } else if (location.pathname === ROUTES.HOME ||
      location.pathname === ROUTES.MEMOS ||
      location.pathname === ROUTES.CHECKLISTS) {
      setSelectedNoteId(null);
    }
  }, [routeNoteId, location.pathname]);

  if (!user) {
    return null;
  }

  const handleCreateNote = async (noteTypeParam: keyof typeof NOTE_TYPES) => {
    try {
      await createNote(noteTypeParam);
      setShowMenu(false);
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleNoteSelect = (noteId: number) => {
    const basePath = location.pathname.split('/notes/')[0];
    const targetPath = basePath.endsWith('/') ? basePath : `${basePath}/`;

    if (isMobile) {
      navigate(`${targetPath}notes/${noteId}`);
    } else {
      // Update both state and route
      setSelectedNoteId(noteId);
      navigate(`${targetPath}notes/${noteId}`, { replace: true });
    }
  };

  const isNoteRoute = !!routeNoteId;

  return (
    <div className={styles.homePage}>
      <Header />
      <main className={`${styles.main} ${isMobile ? styles.mainMobile : styles.mainDesktop}`}>
        {isMobile ? (
          <Box sx={{
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{
              display: isNoteRoute ? 'none' : 'block',
              flex: 1
            }}>
              <MobileNoteListView type={noteTypeParam} tagId={tagId} />
            </Box>
            {isNoteRoute && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'background.paper',
                zIndex: 1
              }}>
                <Outlet />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', width: '100%', height: '100%', minWidth: 0 }}>
            {/* Sidebar in the same flex row */}
            <Paper
              elevation={0}
              sx={{
                flex: '0 0 auto',
                borderRight: '1px solid',
                borderColor: 'divider',
                backgroundColor: '#111',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <DesktopSidebar isOpen={true} />
            </Paper>

            {/* Note list and content */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minWidth: 0 }}>
              <Box sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                <DesktopNoteListView
                  type={noteTypeParam}
                  tagId={tagId}
                  onNoteSelect={handleNoteSelect}
                  selectedNoteId={selectedNoteId}
                />
              </Box>
              <Box sx={{ flex: 1, height: '100%', minWidth: 0 }}>
                {selectedNoteId && (
                  <Box sx={{ p: 2 }}>
                    <Outlet />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </main>
      {!isNoteRoute && <Fab
        color="primary"
        aria-label="Create new note"
        onClick={() => setShowMenu(true)}
        disabled={isCreating}
        sx={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
        }}
      >
        {isCreating ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
      </Fab>}
      {showMenu && (
        <CreateNoteMenu
          onSelect={handleCreateNote}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};