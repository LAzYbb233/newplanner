"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-xl font-semibold">数字自我</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">本周的你</h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            你这周记录了 5 次，整体情绪偏向平稳。数据显示，你在「下午」时段最容易感到疲惫，而在「户外」的照片中笑容最多。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
