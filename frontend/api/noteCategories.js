export const fetchNoteCategories = async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/note-categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch note categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

// export const createNoteCategory = async (categoryData) => {
//   try {
//     const response = await fetch(`http://localhost:8000/api/note_categories`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(categoryData),
//     });
//     if (!response.ok) {
//       throw new Error('Failed to create note category');
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Create error:', error);
//     return null;
//   }
// }
// export const updateNoteCategory = async (id, categoryData) => {
//   try {
//     const response = await fetch(`http://localhost:8000/api/note_categories/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(categoryData),
//     });
//     if (!response.ok) {
//       throw new Error('Failed to update note category');
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Update error:', error);
//     return null;
//   }
// }
// export const deleteNoteCategory = async (id) => {
//   try {
//     const response = await fetch(`http://localhost:8000/api/note_categories/${id}`, {
//       method: 'DELETE',
//     });
//     if (!response.ok) {
//       throw new Error('Failed to delete note category');
//     }
//     return true;
//   } catch (error) {
//     console.error('Delete error:', error);
//     return false;
//   }
// }