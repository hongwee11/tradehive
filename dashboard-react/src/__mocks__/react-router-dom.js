const React = require('react');  
const mockNavigate = jest.fn();

module.exports = {
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => {
    return React.createElement('a', { href: to, ...props }, children);
  },
  __mockNavigate: mockNavigate
};