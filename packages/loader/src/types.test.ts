import { MaybePage } from "./types";
import { PageType, RedirectPage, Page, ResponsePage } from "@ekino/rendr-core";

function returnType(page: MaybePage) {
  if (page instanceof Page) {
    return "page";
  }

  if (page instanceof RedirectPage) {
    return "redirect";
  }

  if (page instanceof ResponsePage) {
    return "response";
  }

  return "there is a bug ...";
}

describe("test types", () => {
  it("PageType is a Page", () => {
    const page: PageType = new Page();

    expect(returnType(page)).toBe("page");
  });

  it("PageType is a RedirectPage", () => {
    const page: PageType = new RedirectPage();

    expect(returnType(page)).toBe("redirect");
  });

  it("PageType is a ResponsePage", () => {
    const page: PageType = new ResponsePage();

    expect(returnType(page)).toBe("response");
  });
});
