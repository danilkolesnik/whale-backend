import './style.css';
interface LoaderProps {
    className?: string;
}

const Loader = ({className}: LoaderProps) => {
    return (
        <span className={`loader_block ${className}`}></span>
    )
}

export default Loader;