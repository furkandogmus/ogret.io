import { resolveMediaUrl } from "../../utils/mediaUrl";

describe("resolveMediaUrl", () => {
  const apiBase = "http://192.168.1.25:3000/api/v1";

  it("resolves same-origin storage paths through the public host", () => {
    expect(resolveMediaUrl("/storage/public-files/avatars/a.png", apiBase))
      .toBe("http://192.168.1.25:3000/storage/public-files/avatars/a.png");
  });

  it("rewrites legacy internal MinIO URLs to the public host", () => {
    expect(resolveMediaUrl("http://minio:9000/public-files/avatars/a.png?x=1", apiBase))
      .toBe("http://192.168.1.25:3000/storage/public-files/avatars/a.png?x=1");
  });

  it("keeps externally hosted images unchanged", () => {
    expect(resolveMediaUrl("https://cdn.example.com/avatar.png", apiBase))
      .toBe("https://cdn.example.com/avatar.png");
  });

  it("rejects opaque and malformed values", () => {
    expect(resolveMediaUrl("identity-document:secret", apiBase)).toBeNull();
    expect(resolveMediaUrl("not a url", apiBase)).toBeNull();
  });
});
