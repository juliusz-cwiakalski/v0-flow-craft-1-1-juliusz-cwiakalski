export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <span>
              Prototype for{" "}
              <a
                href="https://www.aiproductheroes.pl/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline font-medium"
              >
                AI Product Heroes
              </a>{" "}
              certification task
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Created by{" "}
              <a
                href="https://www.linkedin.com/in/juliusz-cwiakalski/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline font-medium"
              >
                Juliusz Ćwiąkalski
              </a>
            </span>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://github.com/juliusz-cwiakalski/v0-flow-craft-1-1-juliusz-cwiakalski"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-medium"
            >
              GitHub Repository
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://github.com/juliusz-cwiakalski/v0-flow-craft-1-1-juliusz-cwiakalski/blob/main/doc/spec/specification.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-medium"
            >
              System Specification
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
