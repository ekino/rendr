const mockPosts = [
  {
    id: 1,
    title: 'Post1',
    text: 'Post1 text',
  },
  {
    id: 2,
    title: 'Post2',
    text: 'Post2 text',
  },
  {
    id: 3,
    title: 'Post3',
    text: 'Post3 text',
  },
];

export function action$fetchPosts() {
  return {
    type: 'FETCH_POSTS',
    payload: mockPosts,
  };
}
