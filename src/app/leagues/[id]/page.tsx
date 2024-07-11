interface PageProps {
  params: {
    id: string;
  };
}

export default function League({ params }: PageProps) {
  

  return <div>{params.id}</div>;
}
