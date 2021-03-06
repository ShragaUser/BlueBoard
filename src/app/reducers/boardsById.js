import { ADMIN_ROLE , BOARD_BG_URLS} from '../../constants';

const boardsById = (state = {}, action) => {
  switch (action.type) {
    case "ADD_LIST": {
      const { boardId, listId } = action.payload;
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          lists: [...state[boardId].lists, listId],
        }
      };
    }
    case "ADD_USER": {
      const {boardId, userToAdd} = action.payload;
      const users = state[boardId].users.filter(user => user.id === userToAdd.id);
      let newUsers;
      if(users.length === 0){
        newUsers = [...state[boardId].users, userToAdd];
      }else{
        newUsers = [...state[boardId].users];
      }
      return {
        ...state,
        [boardId] : {
          ...state[boardId],
          users: newUsers

        }
      }
    }

    case "CHANGE_USER_WATCH" : {
      const {boardId, userId, newWatchMode: watch} = action.payload;
      // Finds the user (by userId) and change only it's watch mode
      const newUsers = state[boardId].users.map(user => user.id === userId ? {...user, watch} : user);

      return {
        ...state,
        [boardId] : {
          ...state[boardId],
          users: newUsers
        }
      }

    }

    case "CHANGE_USER_ROLE" : {
      const {boardId, userId, role} = action.payload;
      // Finds the user (by userId) and change only it's role
      const newUsers = state[boardId].users.map(user => user.id === userId ? {...user, role} : user);
      return {
        ...state,
        [boardId] : {
          ...state[boardId],
          users: newUsers
        }
      }
    }
    case "REMOVE_USER": {
      const {boardId, userIdToRemove} = action.payload;
      const newUsers = state[boardId].users.filter(user => user.id !== userIdToRemove);

      return {
        ...state,
        [boardId] : {
          ...state[boardId],
          users: newUsers
        }
      }
    }
    case "MOVE_LIST": {
      let  { oldListIndex, newListIndex, boardId } = action.payload;
      oldListIndex = state[boardId].lists.length - 1 - oldListIndex;
      newListIndex = state[boardId].lists.length - 1 - newListIndex;
      const newLists = Array.from(state[boardId].lists);
      const [removedList] = newLists.splice(oldListIndex, 1);
      newLists.splice(newListIndex, 0, removedList);
      return {
        ...state,
        [boardId]: { ...state[boardId], lists: newLists }
      };
    }
    case "DELETE_LIST": {
      const { listId: newListId, boardId } = action.payload;
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          lists: state[boardId].lists.filter(listId => listId !== newListId)
        }
      };
    }
    case "REMOVE_LABEL_FROM_BOARD":{
      const {boardId,labelToRemove} = action.payload;
      const boardLabels = state[boardId].labels || [];
      boardLabels.map((label,index) =>{
        if(label.id === labelToRemove){
          boardLabels.splice(index, 1);
        }
      })
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          labels: boardLabels
        }
      };
    }
    case "Edit_LABEL":{
      const {boardId,editedLabel} = action.payload;
      const boardLabels = state[boardId].labels || [];
      boardLabels.map((label,index) =>{
        if(label.id === editedLabel.id){
          if(!editedLabel.color){
            editedLabel.color=label.color;
          }
          if(!editedLabel.title){
            editedLabel.title=label.title;
          }
          boardLabels.splice(index, 1);
        }
      })

      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          labels: [...state[boardId].labels, editedLabel]
        }
      };
    }
    case "ADD_LABEL_TO_BOARD":{
      const {boardId,labelToAdd} = action.payload;

      if(state[boardId].labels === undefined){
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          labels: labelToAdd
        }
      };
    }
        return {
          ...state,
          [boardId]: {
            ...state[boardId],
            labels: [...state[boardId].labels, labelToAdd]
          }
        };
      
    }

    case "ADD_BOARD": {
      const { boardTitle, boardId, userId,labels } = action.payload;
      const image = BOARD_BG_URLS[Math.floor(Math.random()*BOARD_BG_URLS.length)];
      return {
        ...state,
        [boardId]: {
          _id: boardId,
          title: boardTitle,
          lists: [],
          users: [{id: userId, role: ADMIN_ROLE}],
          color: "blue",
          backgroundImage: image,
          labels
        }
      };
    }
    case "CHANGE_BOARD_TITLE": {
      const { boardTitle, boardId } = action.payload;
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          title: boardTitle
        }
      };
    }
    case "CHANGE_BOARD_COLOR": {
      const { boardId, color } = action.payload;
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          color
        }
      };
    }
    case "CHANGE_BOARD_IMAGE": {
      const { boardId, backgroundImage } = action.payload;
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          backgroundImage
        }
      }
    }
    case "DELETE_BOARD": {
      const { boardId } = action.payload;
      const { [boardId]: deletedBoard, ...restOfBoards } = state;
      return restOfBoards;
    }
    case "ARCHIVE_BOARD": {
      const { boardId, userId } = action.payload;
      let users = [...state[boardId].users];
      users = users.map(user => user.id === userId ? {...user, isArchived: true} : user);
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          users
        }
      }
    }
    case "UNARCHIVE_BOARD": {
      const { boardId, userId } = action.payload;
      let users = [...state[boardId].users];
      users = users.map(user => user.id === userId ? {...user, isArchived: false} : user);
      return {
        ...state,
        [boardId]: {
          ...state[boardId],
          users
        }
      }
    }
    default:
      return state;
  }
};

export default boardsById;
