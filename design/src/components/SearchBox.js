import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

export default function SearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [toRedirectSearchPage, setToRedirectSearchPage] = useState(false);
  const submitHandler = (e) => {
    e.preventDefault();
    setToRedirectSearchPage(true);
  };

  useEffect(() => {
    if (toRedirectSearchPage) {
      if (query) {
        navigate(`/search?query=${query}`);
      } else {
        navigate('/search');
      }
    }
  }, [navigate, toRedirectSearchPage, query]);

  return (
    <Form className="d-flex me-auto" onSubmit={submitHandler}>
      <InputGroup>
        <FormControl
          type="text"
          name="q"
          id="q"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search products..."
          aria-label="Search Products"
          aria-describedby="button-search"
        ></FormControl>
        <Button variant="outline-primary" type="submit" id="button-search">
          <i className="fas fa-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
}
