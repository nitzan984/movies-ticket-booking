import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { type Movie } from "../types";
import { Clock, Star } from "lucide-react";
import placeholderImage from "./placeholder.svg";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();

  const handleViewShowtimes = () => {
    navigate(`/movie/${movie.id}/showtimes`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 inset border-orange-500">
      <div className="aspect-[3/4] overflow-hidden">
        <img
          loading="lazy"
          src={`https://picsum.photos/seed/${movie.id}/200/300`}
          alt={movie.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderImage;
          }}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {movie.genre.map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{movie.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{movie.duration} min</span>
          </div>
        </div>        
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleViewShowtimes} className="w-full">
          View Showtimes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MovieCard;
